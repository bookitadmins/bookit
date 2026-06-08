from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import List
from uuid import UUID

from database import get_db
from models import User, Canteen, MenuItem
from schemas import (
    MenuItemCreate, MenuItemUpdate, MenuItemOut, MenuItemWithCanteen,
    PriceComparisonResult
)
from auth import get_current_user, require_owner
import minio_client as mc

router = APIRouter(tags=["menu"])


@router.get("/api/v1/canteens/{canteen_id}/menu", response_model=List[MenuItemOut])
async def get_menu(canteen_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(MenuItem).where(MenuItem.canteen_id == canteen_id)
    )
    return [MenuItemOut.model_validate(item) for item in result.scalars().all()]


@router.post("/api/v1/canteens/{canteen_id}/menu", response_model=MenuItemOut, status_code=201)
async def add_menu_item(
    canteen_id: UUID,
    payload: MenuItemCreate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    # Ensure canteen belongs to owner
    result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
    if canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your canteen")

    item = MenuItem(
        canteen_id=canteen_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        category=payload.category,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return MenuItemOut.model_validate(item)


@router.patch("/api/v1/menu/{item_id}", response_model=MenuItemOut)
async def update_menu_item(
    item_id: UUID,
    payload: MenuItemUpdate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Verify ownership via canteen
    canteen_result = await db.execute(select(Canteen).where(Canteen.id == item.canteen_id))
    canteen = canteen_result.scalar_one_or_none()
    if not canteen or canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your menu item")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    await db.flush()
    await db.refresh(item)
    return MenuItemOut.model_validate(item)


@router.delete("/api/v1/menu/{item_id}", status_code=204)
async def delete_menu_item(
    item_id: UUID,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    canteen_result = await db.execute(select(Canteen).where(Canteen.id == item.canteen_id))
    canteen = canteen_result.scalar_one_or_none()
    if not canteen or canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your menu item")

    await db.delete(item)


@router.post("/api/v1/menu/{item_id}/image", response_model=MenuItemOut)
async def upload_menu_item_image(
    item_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    data = await file.read()
    try:
        url = mc.upload_file(mc.BUCKET_MENU, data, file.content_type or "image/jpeg", prefix=str(item.canteen_id))
        item.image_url = url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

    await db.flush()
    await db.refresh(item)
    return MenuItemOut.model_validate(item)


@router.get("/api/v1/search", response_model=List[PriceComparisonResult])
async def search_dish(
    q: str = Query(min_length=1),
    db: AsyncSession = Depends(get_db),
):
    """Cross-canteen price comparison: search a dish name across all canteens."""
    result = await db.execute(
        select(MenuItem).where(
            MenuItem.name.ilike(f"%{q}%"),
            MenuItem.is_available == True,
        )
    )
    items = result.scalars().all()

    output = []
    for item in items:
        canteen_result = await db.execute(select(Canteen).where(Canteen.id == item.canteen_id))
        canteen = canteen_result.scalar_one_or_none()
        if canteen:
            output.append(
                PriceComparisonResult(
                    menu_item=MenuItemOut.model_validate(item),
                    canteen=__import__("schemas").CanteenOut.model_validate(canteen),
                )
            )
    # Sort by price ascending for best-value-first
    output.sort(key=lambda x: x.menu_item.price)
    return output
