from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID

from database import get_db
from models import User, Canteen, Order
from schemas import OwnerApprovalOut, AdminStatsOut, UserOut
from auth import require_admin

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut)
async def get_stats(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users_r = await db.execute(select(func.count(User.id)))
    total_students_r = await db.execute(select(func.count(User.id)).where(User.role == "student_resident"))
    total_owners_r = await db.execute(select(func.count(User.id)).where(User.role == "canteen_owner"))
    pending_owners_r = await db.execute(
        select(func.count(User.id)).where(User.role == "canteen_owner", User.is_approved == False)
    )
    approved_owners_r = await db.execute(
        select(func.count(User.id)).where(User.role == "canteen_owner", User.is_approved == True)
    )
    total_canteens_r = await db.execute(select(func.count(Canteen.id)))
    total_orders_r = await db.execute(select(func.count(Order.id)))

    return AdminStatsOut(
        total_users=total_users_r.scalar() or 0,
        total_students=total_students_r.scalar() or 0,
        total_owners=total_owners_r.scalar() or 0,
        pending_owners=pending_owners_r.scalar() or 0,
        approved_owners=approved_owners_r.scalar() or 0,
        total_canteens=total_canteens_r.scalar() or 0,
        total_orders=total_orders_r.scalar() or 0,
    )


@router.get("/owners", response_model=List[OwnerApprovalOut])
async def list_owners(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.role == "canteen_owner")
        .order_by(User.is_approved.asc())  # pending first
    )
    return [OwnerApprovalOut.model_validate(u) for u in result.scalars().all()]


@router.put("/owners/{owner_id}/approve", response_model=OwnerApprovalOut)
async def approve_owner(
    owner_id: UUID,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == owner_id, User.role == "canteen_owner"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Canteen owner not found")
    user.is_approved = True
    await db.flush()
    await db.refresh(user)
    return OwnerApprovalOut.model_validate(user)


@router.put("/owners/{owner_id}/reject", response_model=OwnerApprovalOut)
async def reject_owner(
    owner_id: UUID,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == owner_id, User.role == "canteen_owner"))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Canteen owner not found")
    user.is_approved = False
    await db.flush()
    await db.refresh(user)
    return OwnerApprovalOut.model_validate(user)


@router.get("/users", response_model=List[UserOut])
async def list_users(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.role))
    return [UserOut.model_validate(u) for u in result.scalars().all()]


@router.get("/canteens")
async def list_all_canteens(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    from schemas import CanteenWithOwner
    result = await db.execute(select(Canteen))
    return [CanteenWithOwner.model_validate(c) for c in result.scalars().all()]
