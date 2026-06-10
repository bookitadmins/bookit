# Admin Files Documentation

Detailed breakdown of each core file in the `admin/src/` directory.

---

## `App.jsx`
- Defines the layout for the admin panel, including a persistent `AdminSidebar`.
- Protects admin routes, ensuring only users with the `admin` role can access them.

## `services/api.js`
- Contains methods specifically for admin tasks:
    - `adminAuthAPI.login(data)`: Authenticates the admin user.
    - `adminAPI.stats()`: Fetches global platform metrics.
    - `adminAPI.listOwners()`: Retrieves a list of all owners and their approval status.
    - `adminAPI.approveOwner(id)`: Approves a pending owner.
    - `adminAPI.rejectOwner(id)`: Rejects or deactivates an owner.
    - `adminAPI.listUsers()`: Retrieves all registered users.
    - `adminAPI.listCanteens()`: Retrieves all canteens with owner details.

## `contexts/AdminAuthContext.jsx`
- Similar to the main `AuthContext` but tailored for admin users.
- Stores the admin token and profile information.
- Provides a `logout` function to clear admin credentials.

## `pages/`
- **`AdminDashboard/`**: Uses `AdminStatsOut` to show key performance indicators.
- **`OwnersApproval/`**: A list of users with the `canteen_owner` role where admins can toggle `is_approved`.
- **`CanteensList/`**: A comprehensive table showing all canteens and their respective owners.
