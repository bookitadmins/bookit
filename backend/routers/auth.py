from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User
from schemas import RegisterRequest, LoginRequest, TokenResponse, UserOut
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Students are auto-approved; canteen owners need admin approval
    is_approved = payload.role == "student_resident"

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
        phone=payload.phone,
        role=payload.role,
        is_approved=is_approved,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(str(user.id), user.role, user.is_approved)
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user.id), user.role, user.is_approved)
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
