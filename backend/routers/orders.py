from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
from decimal import Decimal

from database import get_db
from models import User, Canteen, MenuItem, Order, OrderItem
from schemas import OrderCreate, OrderStatusUpdate, OrderOut
from auth import get_current_user, require_owner
from websocket_manager import ws_manager

router = APIRouter(prefix="/api/v1/orders", tags=["orders"])


def _order_query():
    """Base query with all relationships eagerly loaded."""
    return (
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.canteen),
            selectinload(Order.user),
        )
    )


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate canteen
    canteen_result = await db.execute(select(Canteen).where(Canteen.id == payload.canteen_id))
    canteen = canteen_result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")

    # Build order items and compute total
    total = Decimal("0")
    order_items_data = []
    for item_req in payload.items:
        mi_result = await db.execute(select(MenuItem).where(MenuItem.id == item_req.menu_item_id))
        mi = mi_result.scalar_one_or_none()
        if not mi:
            raise HTTPException(status_code=404, detail=f"Menu item {item_req.menu_item_id} not found")
        if not mi.is_available:
            raise HTTPException(status_code=400, detail=f"'{mi.name}' is not available")
        subtotal = mi.price * item_req.quantity
        total += subtotal
        order_items_data.append(OrderItem(
            menu_item_id=mi.id,
            name=mi.name,
            price=mi.price,
            quantity=item_req.quantity,
        ))

    order = Order(
        user_id=current_user.id,
        canteen_id=payload.canteen_id,
        status="pending",
        total_amount=total,
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    for oi in order_items_data:
        oi.order_id = order.id
        db.add(oi)
    await db.flush()

    # Notify canteen owner via WebSocket
    customer_name = current_user.student_profile.name if current_user.student_profile else "Customer"
    await ws_manager.send_to_user(
        str(canteen.owner_id),
        {
            "type": "new_order",
            "order_id": str(order.id),
            "customer_name": customer_name,
            "total_amount": str(total),
            "item_count": sum(i.quantity for i in order_items_data),
            "message": f"New order from {customer_name}! ₹{total}",
        },
    )

    # Re-fetch with relationships loaded
    result = await db.execute(_order_query().where(Order.id == order.id))
    order = result.scalar_one()
    return OrderOut.model_validate(order)


@router.get("/my", response_model=List[OrderOut])
async def my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        _order_query()
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    return [OrderOut.model_validate(o) for o in result.scalars().all()]


@router.get("/canteen/{canteen_id}", response_model=List[OrderOut])
async def canteen_orders(
    canteen_id: UUID,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    # Verify ownership
    canteen_result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = canteen_result.scalar_one_or_none()
    if not canteen or canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your canteen")

    result = await db.execute(
        _order_query()
        .where(Order.canteen_id == canteen_id)
        .order_by(Order.created_at.desc())
    )
    return [OrderOut.model_validate(o) for o in result.scalars().all()]


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: UUID,
    payload: OrderStatusUpdate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Verify canteen ownership
    canteen_result = await db.execute(select(Canteen).where(Canteen.id == order.canteen_id))
    canteen = canteen_result.scalar_one_or_none()
    if not canteen or canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")

    order.status = payload.status
    if payload.estimated_prep_time is not None:
        order.estimated_prep_time = payload.estimated_prep_time

    await db.flush()

    # Determine notification message
    status_messages = {
        "preparing": f"Your order is being prepared! Estimated time: {payload.estimated_prep_time or '?'} mins.",
        "ready_in_5": "🔔 Your food is ready in 5 minutes! Come and collect it.",
        "completed": "✅ Your order is complete. Enjoy your meal!",
        "cancelled": "❌ Your order has been cancelled.",
    }
    msg = status_messages.get(payload.status)
    if msg:
        await ws_manager.send_to_user(
            str(order.user_id),
            {
                "type": "order_update",
                "order_id": str(order.id),
                "status": payload.status,
                "message": msg,
                "canteen_name": canteen.name,
            },
        )

    # Re-fetch with relationships loaded
    result = await db.execute(_order_query().where(Order.id == order.id))
    order = result.scalar_one()
    return OrderOut.model_validate(order)
