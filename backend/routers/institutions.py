from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from database import get_db
from models import Institution
from schemas import InstitutionCreate, InstitutionUpdate, InstitutionOut
from auth import require_super_admin

router = APIRouter(prefix="/api/v1/institutions", tags=["institutions"])


@router.get("", response_model=List[InstitutionOut])
async def list_institutions(db: AsyncSession = Depends(get_db)):
    """Publicly list all institutions for registration dropdown."""
    result = await db.execute(select(Institution).order_by(Institution.name))
    return [InstitutionOut.model_validate(i) for i in result.scalars().all()]


@router.post("", response_model=InstitutionOut, status_code=status.HTTP_201_CREATED)
async def create_institution(
    payload: InstitutionCreate,
    admin=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    institution = Institution(**payload.model_dump())
    db.add(institution)
    await db.commit()
    await db.refresh(institution)
    return InstitutionOut.model_validate(institution)


@router.get("/{institution_id}", response_model=InstitutionOut)
async def get_institution(institution_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Institution).where(Institution.id == institution_id))
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return InstitutionOut.model_validate(institution)


@router.patch("/{institution_id}", response_model=InstitutionOut)
async def update_institution(
    institution_id: UUID,
    payload: InstitutionUpdate,
    admin=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Institution).where(Institution.id == institution_id))
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(institution, key, value)

    await db.commit()
    await db.refresh(institution)
    return InstitutionOut.model_validate(institution)


@router.delete("/{institution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_institution(
    institution_id: UUID,
    admin=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Institution).where(Institution.id == institution_id))
    institution = result.scalar_one_or_none()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")

    await db.delete(institution)
    await db.commit()
    return None
