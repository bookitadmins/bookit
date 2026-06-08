import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from websocket_manager import ws_manager
from auth import decode_token, hash_password
import minio_client as mc

from routers import auth, canteens, menu, orders
from routers import admin as admin_router


async def seed_admin():
    """Ensure a default admin account exists on startup."""
    from database import AsyncSessionLocal
    from models import User
    from sqlalchemy import select

    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@bookit.app")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if not existing:
            admin = User(
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                name="BookIt Admin",
                phone="0000000000",
                role="admin",
                is_approved=True,
            )
            session.add(admin)
            await session.commit()
            print(f"✅ Default admin created: {ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin already exists: {ADMIN_EMAIL}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await seed_admin()
    try:
        mc.ensure_buckets()
    except Exception as e:
        print(f"MinIO setup skipped: {e}")
    yield


app = FastAPI(
    title="Book It — Campus Food Pre-Booking API",
    version="1.0.0",
    description="Real-time campus canteen food ordering platform",
    lifespan=lifespan,
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ADMIN_URL = os.getenv("ADMIN_URL", "http://localhost:5174")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL, ADMIN_URL,
        "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(canteens.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(admin_router.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Book It API"}


# ─── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = Query(...)):
    try:
        payload = decode_token(token)
        if payload.get("sub") != user_id:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
