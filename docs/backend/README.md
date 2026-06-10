# Backend Documentation

The backend is built with **FastAPI** and uses **SQLAlchemy** for ORM.

## 📁 File Reference

| File | Description |
|---|---|
| [`main.py`](./files.md#mainpy) | Application entry point and configuration. |
| [`models.py`](./files.md#modelspy) | Database models defined with SQLAlchemy. |
| [`schemas.py`](./files.md#schemaspy) | Pydantic models for request/response validation. |
| [`database.py`](./files.md#databasepy) | Database connection and session management. |
| [`auth.py`](./files.md#authpy) | Authentication logic, JWT handling, and security dependencies. |
| [`minio_client.py`](./files.md#minio_clientpy) | S3-compatible storage client for image uploads. |
| [`websocket_manager.py`](./files.md#websocket_managerpy) | Manages WebSocket connections for real-time notifications. |

## 📡 API Routers

- [`routers/auth.py`](./api.md#auth) — Registration and Login.
- [`routers/canteens.py`](./api.md#canteens) — Canteen management and reviews.
- [`routers/menu.py`](./api.md#menu) — Menu item CRUD and search.
- [`routers/orders.py`](./api.md#orders) — Order placement and status updates.
- [`routers/admin.py`](./api.md#admin) — Admin-only statistics and approvals.
