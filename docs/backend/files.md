# Backend Files Documentation

Detailed breakdown of each file in the `backend/` directory.

---

## `main.py`
The central entry point of the FastAPI application.
- **Lifespan Management:** Initializes the database and seeds the default super-admin account. All other configurations (institutions, etc.) are handled by the Super Admin via the dashboard.
- **Router Inclusion:** Mounts all API routers, including the new `institutions` router.

## `models.py`
Contains the SQLAlchemy database models.
- **`User`:** Base authentication model with role-based access control.
- **`Institution`:** Represents an IIT or campus (name, short name, domain, etc.).
- **Profiles:** Role-specific data storage:
    - **`StudentProfile`:** Roll number, hostel, room, wallet balance.
    - **`CanteenOwnerProfile`:** FSSAI license, business name.
    - **`InstituteAdminProfile`:** Institutional oversight.
- **`Canteen`:** Linked to an owner and an institution.
- **`MenuItem`:** Individual items in a canteen's menu.
- **`Order`:** Scoped by canteen and user within an institution.
- **`Review`:** User-submitted ratings and comments.

## `schemas.py`
Defines Pydantic models for request validation and response serialization.
- **Auth:** `RegisterRequest` (updated with role-specific fields), `UserOut` (with profile expansion).
- **Institution:** `InstitutionCreate`, `InstitutionUpdate`, `InstitutionOut`.
- **Canteen:** `CanteenCreate` (includes `institute_id`), `CanteenOut`.

## `auth.py`
Core security and authentication module.
- **JWT Handling:** Token payload now includes `institute_id`.
- **Dependencies:**
    - `get_current_user`: Loads the user and their specific profile.
    - `require_super_admin`, `require_institute_admin`, `require_owner`, `require_student`: Tiered access control.

## `routers/`
- **`institutions.py`:** CRUD for platform-wide institutions (Super Admin only).
- **`admin.py`:** Refactored for tiered stats and institute-scoped owner management.
- **`auth.py`:** Atomic user and profile creation.
- **`canteens.py` & `menu.py`:** Scoped queries using `institute_id` from the token.

## `websocket_manager.py`
Manages active WebSocket connections for real-time notifications.

## `minio_client.py`
Wrapper for S3-compatible storage interaction.
