# Architecture Overview

The BookIt platform is designed with a decoupled architecture, separating the backend API, the user-facing frontend, and the admin dashboard. The recent refactor introduces a **Multi-Institution** model, allowing a single deployment to serve multiple IITs and campuses with strict data isolation.

## 🏗️ System Components

### 1. Backend (FastAPI)
The core of the system, handling business logic, database interactions, authentication, and real-time messaging.
- **REST API:** Serves all CRUD operations for institutions, canteens, menus, and orders.
- **Data Scoping:** All student and owner operations are automatically scoped by their `institute_id`.
- **WebSocket Server:** Manages persistent connections to provide live order updates to students and owners within their institutions.
- **Background Tasks:** Handles database initialization and default super-admin seeding on first startup.

### 2. Frontend (React)
A SPA (Single Page Application) catering to institutional roles:
- **Students/Residents:** Can browse canteens *within their institute*, search for dishes, compare prices locally, place orders, and track order status.
- **Canteen Owners:** Can manage their canteen profile, edit the menu, and fulfill incoming orders in real-time.
- **Institute Admins:** Manage canteen owners and view statistics for their specific institution.

### 3. Admin Dashboard (React)
A dedicated interface for **Super Admins** to:
- Manage the global list of institutions.
- Monitor platform-wide statistics.
- Manage/Disable user accounts globally.

### 4. Database (PostgreSQL)
A relational database storing institutions, users, role-specific profiles, canteens, menu items, orders, and reviews. Relationships and data isolation are managed using SQLAlchemy.

### 5. File Storage (MinIO)
An S3-compatible object store used for hosting:
- Canteen banner images.
- Menu item photos.

## 🔄 Data Flow

1.  **Authentication:** Users register by selecting their institution. The backend creates a `User` and a role-specific `Profile` (Student/Owner) atomically. JWT tokens include the `institute_id` for scoped requests.
2.  **Order Placement:** A student selects items from their institute's canteens and places an order. The backend validates the order, saves it to PostgreSQL, and notifies the relevant owner via a WebSocket message.
3.  **Order Processing:** The owner receives a "new_order" notification. They update the status (e.g., "preparing", "ready_in_5"). Each status update sends a WebSocket notification back to the student.
4.  **Review System:** Once an order is completed, the student can leave a review, which automatically updates the canteen's average rating in the database.
5.  **Multi-Institution Isolation:** Students and Owners are "locked" to their institution. A student at IIT Bombay cannot see menus or place orders at IIT Delhi.
