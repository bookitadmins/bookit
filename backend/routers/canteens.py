from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc, func
from typing import List, Optional
from uuid import UUID

from database import get_db
from models import User, Canteen, Review
from schemas import (
    CanteenCreate, CanteenUpdate, CanteenOut, CanteenWithOwner,
    ReviewCreate, ReviewOut
)
from auth import get_current_user, require_owner
import minio_client as mc

router = APIRouter(prefix="/api/v1/canteens", tags=["canteens"])


@router.get("", response_model=List[CanteenOut])
async def list_canteens(
    sort: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    order_fn = desc if sort == "desc" else asc
    result = await db.execute(
        select(Canteen).order_by(order_fn(Canteen.rating))
    )
    return [CanteenOut.model_validate(c) for c in result.scalars().all()]


@router.get("/{canteen_id}", response_model=CanteenWithOwner)
async def get_canteen(canteen_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
    return CanteenWithOwner.model_validate(canteen)


@router.post("", response_model=CanteenOut, status_code=201)
async def create_canteen(
    payload: CanteenCreate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    canteen = Canteen(
        owner_id=current_user.id,
        name=payload.name,
        description=payload.description,
    )
    db.add(canteen)
    await db.flush()
    await db.refresh(canteen)
    return CanteenOut.model_validate(canteen)


@router.patch("/{canteen_id}", response_model=CanteenOut)
async def update_canteen(
    canteen_id: UUID,
    payload: CanteenUpdate,
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
    if canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your canteen")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(canteen, field, value)
    await db.flush()
    await db.refresh(canteen)
    return CanteenOut.model_validate(canteen)


@router.post("/{canteen_id}/image", response_model=CanteenOut)
async def upload_canteen_image(
    canteen_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
    if canteen.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your canteen")

    data = await file.read()
    try:
        url = mc.upload_file(mc.BUCKET_CANTEENS, data, file.content_type or "image/jpeg", prefix=str(canteen_id))
        canteen.image_url = url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

    await db.flush()
    await db.refresh(canteen)
    return CanteenOut.model_validate(canteen)


# ─── Reviews ───────────────────────────────────────────────────────────────────

@router.get("/{canteen_id}/reviews", response_model=List[ReviewOut])
async def list_reviews(canteen_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review).where(Review.canteen_id == canteen_id).order_by(Review.created_at.desc())
    )
    return [ReviewOut.model_validate(r) for r in result.scalars().all()]


@router.post("/{canteen_id}/reviews", response_model=ReviewOut, status_code=201)
async def create_review(
    canteen_id: UUID,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check canteen exists
    result = await db.execute(select(Canteen).where(Canteen.id == canteen_id))
    canteen = result.scalar_one_or_none()
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")

    review = Review(
        user_id=current_user.id,
        canteen_id=canteen_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    await db.flush()

    # Recompute average rating
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.canteen_id == canteen_id)
    )
    avg = avg_result.scalar() or 0
    canteen.rating = round(float(avg), 2)
    await db.flush()
    await db.refresh(review)
    return ReviewOut.model_validate(review)
