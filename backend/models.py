import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Numeric, Boolean, Integer,
    ForeignKey, DateTime, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'student_resident' | 'canteen_owner' | 'admin'
    name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    # Canteen owners start as not approved; students and admins are auto-approved
    is_approved = Column(Boolean, default=True, nullable=False)

    canteens = relationship("Canteen", back_populates="owner", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Canteen(Base):
    __tablename__ = "canteens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    image_url = Column(String(500), default="")
    rating = Column(Numeric(3, 2), default=0.00)
    is_open = Column(Boolean, default=True)

    owner = relationship("User", back_populates="canteens")
    menu_items = relationship("MenuItem", back_populates="canteen", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="canteen", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="canteen", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canteen_id = Column(UUID(as_uuid=True), ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    price = Column(Numeric(10, 2), nullable=False)
    category = Column(String(50), default="General")
    image_url = Column(String(500), default="")
    is_available = Column(Boolean, default=True)

    canteen = relationship("Canteen", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    canteen_id = Column(UUID(as_uuid=True), ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    estimated_prep_time = Column(Integer, nullable=True)
    total_amount = Column(Numeric(10, 2), default=0.00)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    canteen = relationship("Canteen", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(UUID(as_uuid=True), ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    canteen_id = Column(UUID(as_uuid=True), ForeignKey("canteens.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reviews")
    canteen = relationship("Canteen", back_populates="reviews")
