from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, UserRole, StudentProfile, CanteenOwnerProfile, Institution
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Verify institution exists
    inst_res = await db.execute(select(Institution).where(Institution.id == payload.institute_id))
    if not inst_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Institution not found")

    # Students are auto-approved; canteen owners need admin approval
    is_approved = payload.role == UserRole.STUDENT

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_approved=is_approved,
    )
    db.add(user)
    await db.flush()

    if payload.role == UserRole.STUDENT:
        profile = StudentProfile(
            user_id=user.id,
            institute_id=payload.institute_id,
            name=payload.name,
            phone=payload.phone,
            roll_number=payload.roll_number,
            hostel_name=payload.hostel_name,
            room_number=payload.room_number,
        )
        db.add(profile)
    elif payload.role == UserRole.CANTEEN_OWNER:
        profile = CanteenOwnerProfile(
            user_id=user.id,
            institute_id=payload.institute_id,
            name=payload.name,
            phone=payload.phone,
            fssai_license=payload.fssai_license,
        )
        db.add(profile)
    
    await db.commit()
    await db.refresh(user)
    
    # Reload with profile for schema validation
    result = await db.execute(
        select(User)
        .where(User.id == user.id)
        .options(
            selectinload(User.student_profile),
            selectinload(User.owner_profile),
            selectinload(User.admin_profile)
        )
    )
    user = result.scalar_one()

    token = create_access_token(str(user.id), user.role, user.is_approved, str(payload.institute_id))
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .where(User.email == payload.email)
        .options(
            selectinload(User.student_profile),
            selectinload(User.owner_profile),
            selectinload(User.admin_profile)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.is_disabled:
        raise HTTPException(status_code=403, detail="Your account has been disabled")

    # Get institute_id from profile
    inst_id = None
    if user.role == UserRole.STUDENT:
        inst_id = str(user.student_profile.institute_id)
    elif user.role == UserRole.CANTEEN_OWNER:
        inst_id = str(user.owner_profile.institute_id)
    elif user.role == UserRole.INSTITUTE_ADMIN:
        inst_id = str(user.admin_profile.institute_id)

    token = create_access_token(str(user.id), user.role, user.is_approved, inst_id)
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
