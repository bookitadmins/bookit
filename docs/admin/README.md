# Admin Documentation

The admin dashboard is a dedicated React application exclusively for **Super Administrators**.

## 🖼️ Pages

### **Institutions Management** (`/institutions`)
- Interface to create, update, and delete IIT institutions on the platform.
- Managed fields: Full Name, Short Name (e.g., IITB), Domain, City, and Logo.

### **Platform Overview** (`/`)
- Global view of all users, institutions, and platform-wide orders.

### **User Management**
- Super Admins can deactivate/enable any user account globally using the `toggle-disabled` feature.

> ℹ️ **Institutional Management** (for Institute Admins) is handled via the main frontend application at `/admin`.
