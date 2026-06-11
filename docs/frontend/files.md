# Frontend Files Documentation

Detailed breakdown of each core file in the `frontend/src/` directory.

---

## `App.jsx`
The root component that orchestrates the entire application.
- **Routing:** Uses `react-router-dom` to define all paths.
- **Role-Based Access Control:** Implements `ProtectedRoute` to restrict pages based on user role and approval status.
- **Providers:** Wraps the app in `AuthProvider`, `WebSocketProvider`, and `BrowserRouter`.
- **Global UI:** Includes the `Navbar` and the `Toaster` for notifications.

## `main.jsx`
The standard Vite/React entry point that mounts the `App` component to the DOM.

## `services/api.js`
The API client layer.
- **Axios Instance:** Configured with a `baseURL` and default headers.
- **Dynamic Configuration:** Uses `VITE_SERVER_IP` to construct the API URL if `VITE_API_URL` is not provided, allowing for flexible deployments.
- **Interceptors:**
    - **Request:** Automatically attaches the JWT `Authorization` header if a token exists in `localStorage`.
    - **Response:** Handles `401 Unauthorized` errors by clearing local storage and redirecting to the auth page.
- **Endpoint Exports:** Groups API calls into `authAPI`, `canteensAPI`, `menuAPI`, `ordersAPI`, and `instituteAdminAPI` for easy consumption.

## `contexts/AuthContext.jsx`
Manages the global authentication state.
- **State:** Tracks the current `user`, `token`, and `loading` status.
- **Methods:** `login`, `register`, and `logout`.
- **Helpers:** Provides boolean flags like `isOwner`, `isStudent`, `isInstituteAdmin`, and `isAuthenticated`.

## `contexts/WebSocketContext.jsx`
Handles the real-time notification layer.
- **Connection:** Establishes a WebSocket connection to `/ws/{user_id}` upon authentication.
- **Dynamic Configuration:** Uses `VITE_SERVER_IP` to construct the WebSocket URL if `VITE_WS_URL` is not provided.
- **Auto-Reconnect:** Includes logic to reconnect if the connection is dropped.
- **Messaging:** Listens for incoming messages (e.g., `new_order`, `order_update`) and triggers toast notifications.
- **Context Value:** Exposes the `socket` instance and a `connected` status flag.

## `components/`
Directory for reusable UI elements.
- **`Navbar`:** Responsive navigation bar with role-aware links.
- **`CanteenCard`:** Visual representation of a canteen used in lists.
- **`StarRating`:** Reusable component for displaying and inputting ratings.
- **`PriceComparisonRow`:** Layout for search results in the price finder.
