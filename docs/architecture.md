# Architecture Overview

The BookIt platform is designed with a decoupled architecture, separating the backend API, the user-facing frontend, and the admin dashboard.

## 🏗️ System Components

### 1. Backend (FastAPI)
The core of the system, handling business logic, database interactions, authentication, and real-time messaging.
- **REST API:** Serves all CRUD operations for canteens, menus, and orders.
- **WebSocket Server:** Manages persistent connections to provide live order updates to students and owners.
- **Background Tasks:** Handles database initialization and default admin seeding.

### 2. Frontend (React)
A SPA (Single Page Application) catering to two primary roles:
- **Students/Residents:** Can browse canteens, search for dishes, compare prices, place orders, and track order status.
- **Canteen Owners:** Can manage their canteen profile, edit the menu, and fulfill incoming orders in real-time.

### 3. Admin Dashboard (React)
A separate interface for system administrators to:
- Approve or reject new canteen owners.
- Monitor platform statistics (users, canteens, orders).
- View and manage all users and canteens.

### 4. Database (PostgreSQL)
A relational database storing users, canteens, menu items, orders, and reviews. Relationships are managed using SQLAlchemy.

### 5. File Storage (MinIO)
An S3-compatible object store used for hosting:
- Canteen banner images.
- Menu item photos.

## 🔄 Data Flow

1.  **Authentication:** Users register and login via the `/auth` endpoints. JWT tokens are issued and used for subsequent requests.
2.  **Order Placement:** A student selects items from a menu and places an order. The backend validates the order, saves it to PostgreSQL, and notifies the relevant owner via a WebSocket message.
3.  **Order Processing:** The owner receives a "new_order" notification. They update the status (e.g., "preparing", "ready_in_5"). Each status update sends a WebSocket notification back to the student.
4.  **Review System:** Once an order is completed, the student can leave a review, which automatically updates the canteen's average rating in the database.
