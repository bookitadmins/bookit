# Frontend Documentation

The frontend is a React application powered by **Vite**.

## 📁 File Reference

| File | Description |
|---|---|
| [`App.jsx`](./files.md#appjsx) | Main application component, routing, and providers. |
| [`main.jsx`](./files.md#mainjsx) | Entry point for React. |
| [`services/api.js`](./files.md#servicesapijs) | Axios instance and API call definitions. |
| [`contexts/AuthContext.jsx`](./files.md#contextsauthcontextjsx) | Authentication state management. |
| [`contexts/WebSocketContext.jsx`](./files.md#contextswebsocketcontextjsx) | WebSocket connection and notification handling. |

## 🖼️ Pages & Components

The application is split into student and owner roles:

### [Student Pages](./pages.md#student-pages)
- **Dashboard:** Browse and filter canteens.
- **Price Comparison:** Search for dishes across all canteens.
- **Canteen Detail:** View menu and place orders.
- **Order History:** Track past and current orders.

### [Owner Pages](./pages.md#owner-pages)
- **Dashboard:** View incoming orders in real-time.
- **Menu Editor:** Manage menu items and pricing.
- **Order Fulfillment:** Detailed view for processing an order.

### [Institute Admin Pages](./pages.md#institute-admin-pages)
- **Dashboard:** View institutional statistics and alerts.
- **Owner Approvals:** Review and approve canteen owner registrations.

### [Auth & Onboarding](./pages.md#auth--onboarding)
- **AuthPage:** Combined Login/Register.
- **Welcome Pages:** Role-specific onboarding and pending approval status.
