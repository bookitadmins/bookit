# Admin Documentation

The admin dashboard is a dedicated React application for system administrators.

## 📁 File Reference

| File | Description |
|---|---|
| [`App.jsx`](./files.md#appjsx) | Admin-specific routing and layout. |
| [`services/api.js`](./files.md#servicesapijs) | API client for admin endpoints. |
| [`contexts/AdminAuthContext.jsx`](./files.md#contextsadminauthcontextjsx) | Admin authentication state. |

## 🖼️ Pages

- **AdminDashboard:** Displays platform-wide statistics (total orders, pending owners, etc.).
- **OwnersApproval:** Interface to review and approve/reject canteen owner applications.
- **CanteensList:** Overview of all canteens in the system.
- **AdminAuth:** Login page for the admin account.
