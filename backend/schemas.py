from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# ─── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=15)
    role: str = Field(pattern="^(STUDENT|CANTEEN_OWNER)$")
    institute_id: UUID
    
    # Optional fields for STUDENT
    roll_number: Optional[str] = None
    hostel_name: Optional[str] = None
    room_number: Optional[str] = None
    
    # Optional fields for CANTEEN_OWNER
    fssai_license: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: UUID
    email: str
    role: str
    is_approved: bool
    is_disabled: bool
    created_at: datetime
    
    # Profile data (will be populated based on role)
    student_profile: Optional["StudentProfileOut"] = None
    owner_profile: Optional["CanteenOwnerProfileOut"] = None
    admin_profile: Optional["InstituteAdminProfileOut"] = None

    model_config = {"from_attributes": True}


# ─── Institution ───────────────────────────────────────────────────────────────

class InstitutionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    short_name: str = Field(min_length=2, max_length=20)
    domain: Optional[str] = None
    logo_url: Optional[str] = None
    city: Optional[str] = None


class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    domain: Optional[str] = None
    logo_url: Optional[str] = None
    city: Optional[str] = None


class InstitutionOut(BaseModel):
    id: UUID
    name: str
    short_name: str
    domain: Optional[str]
    logo_url: Optional[str]
    city: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Profiles ──────────────────────────────────────────────────────────────────

class StudentProfileOut(BaseModel):
    id: UUID
    institute_id: UUID
    name: str
    phone: str
    roll_number: Optional[str]
    hostel_name: Optional[str]
    room_number: Optional[str]
    wallet_balance: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class CanteenOwnerProfileOut(BaseModel):
    id: UUID
    institute_id: UUID
    name: str
    phone: str
    fssai_license: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class InstituteAdminProfileOut(BaseModel):
    id: UUID
    institute_id: UUID
    name: str
    phone: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Admin ─────────────────────────────────────────────────────────────────────

class OwnerApprovalOut(BaseModel):
    id: UUID
    email: str
    is_approved: bool
    role: str
    owner_profile: Optional[CanteenOwnerProfileOut]

    model_config = {"from_attributes": True}


class AdminStatsOut(BaseModel):
    total_users: int
    total_institutions: int
    total_students: int
    total_owners: int
    pending_owners: int
    approved_owners: int
    total_canteens: int
    total_orders: int


# ─── Canteen ───────────────────────────────────────────────────────────────────

class CanteenCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = ""
    institute_id: UUID


class CanteenUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_open: Optional[bool] = None


class CanteenOut(BaseModel):
    id: UUID
    owner_id: UUID
    institute_id: UUID
    name: str
    description: str
    image_url: str
    rating: Decimal
    is_open: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CanteenWithOwner(CanteenOut):
    owner: UserOut


# ─── Menu Item ─────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str = ""
    price: Decimal = Field(gt=0)
    category: str = "General"


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    is_available: Optional[bool] = None


class MenuItemOut(BaseModel):
    id: UUID
    canteen_id: UUID
    name: str
    description: str
    price: Decimal
    category: str
    image_url: str
    is_available: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MenuItemWithCanteen(MenuItemOut):
    canteen: CanteenOut


# ─── Order ─────────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: UUID
    quantity: int = Field(ge=1, default=1)


class OrderCreate(BaseModel):
    canteen_id: UUID
    items: List[OrderItemCreate]
    notes: str = ""


class OrderItemOut(BaseModel):
    id: UUID
    menu_item_id: Optional[UUID]
    name: str
    price: Decimal
    quantity: int

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str = Field(pattern="^(pending|preparing|ready_in_5|completed|cancelled)$")
    estimated_prep_time: Optional[int] = None


class OrderOut(BaseModel):
    id: UUID
    user_id: UUID
    canteen_id: UUID
    status: str
    estimated_prep_time: Optional[int]
    total_amount: Decimal
    notes: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemOut] = []
    canteen: Optional[CanteenOut] = None
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}


# ─── Review ────────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ReviewOut(BaseModel):
    id: UUID
    user_id: UUID
    canteen_id: UUID
    rating: int
    comment: str
    created_at: datetime
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}


# ─── Search ────────────────────────────────────────────────────────────────────

class PriceComparisonResult(BaseModel):
    menu_item: MenuItemOut
    canteen: CanteenOut


TokenResponse.model_rebuild()
UserOut.model_rebuild()
