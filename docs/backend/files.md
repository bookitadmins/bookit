# Backend Files Documentation

Detailed breakdown of each file in the `backend/` directory.

---

## `main.py`
The central entry point of the FastAPI application.
- **Lifespan Management:** Initializes the database, seeds the default admin account, and ensures MinIO buckets exist.
- **Middleware:** Configures CORS to allow requests from the frontend and admin dashboard.
- **Router Inclusion:** Mounts all API routers under their respective prefixes.
- **WebSocket Route:** Defines the `/ws/{user_id}` endpoint for real-time notifications, including token validation.
- **Health Check:** Provides a `/health` endpoint for monitoring.

## `models.py`
Contains the SQLAlchemy database models.
- **`User`:** Stores user information, roles (`student_resident`, `canteen_owner`, `admin`), and approval status.
- **`Canteen`:** Represents a canteen, linked to an owner. Tracks rating and open/closed status.
- **`MenuItem`:** Individual items in a canteen's menu.
- **`Order`:** Tracks order status (`pending`, `preparing`, `ready_in_5`, `completed`, `cancelled`) and total amount.
- **`OrderItem`:** A snapshot of menu items included in an order at the time of purchase.
- **`Review`:** User-submitted ratings and comments for canteens.

## `schemas.py`
Defines Pydantic models (Data Transfer Objects) for request validation and response serialization.
- **Auth:** `RegisterRequest`, `LoginRequest`, `TokenResponse`.
- **Canteen:** `CanteenCreate`, `CanteenUpdate`, `CanteenOut`.
- **Order:** `OrderCreate`, `OrderStatusUpdate`, `OrderOut`.
- **Search:** `PriceComparisonResult`.

## `database.py`
Handles the asynchronous connection to the PostgreSQL database.
- Uses `SQLAlchemy` with the `asyncpg` driver.
- Provides `get_db` dependency for injecting database sessions into routes.
- Includes `init_db` function to create tables based on the models.

## `auth.py`
Core security and authentication module.
- **Password Hashing:** Uses `bcrypt` for secure password storage.
- **JWT Handling:** Uses `python-jose` to create and decode JSON Web Tokens.
- **Dependencies:**
    - `get_current_user`: Validates the JWT and returns the User object.
    - `require_owner`, `require_student`, `require_admin`: Role-based access control.

## `websocket_manager.py`
Manages active WebSocket connections.
- **`ConnectionManager`:** Tracks active connections in a dictionary mapping `user_id` to a list of `WebSocket` objects.
- **Methods:** `connect`, `disconnect`, `send_to_user`, `broadcast`.

## `minio_client.py`
Wrapper around the MinIO Python SDK for interacting with S3-compatible storage.
- Handles file uploads for canteen banners and menu item images.
- Ensures required buckets (`canteens`, `menu`) exist on startup.
