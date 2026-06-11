# Frontend Pages Documentation

Detailed description of the page components in the frontend.

---

## Student Pages

### `Dashboard` (`/`)
The main entry point for students.
- Lists available canteens **scoped to the student's institution**.
- Displays canteen cards with names, images, and ratings.

### `PriceComparison` (`/search`)
The "Price Finder" feature.
- Allows students to search for any dish name.
- Displays results **from all canteens within the same institute**, sorted by price.

---

## Owner Pages

### `OwnerDashboard` (`/owner`)
The mission control for canteen owners.
- **Live Order Ticker:** Real-time updates for new orders within the owner's canteen.
- **Institutional Context:** Owners only see orders and data for their specific campus.

---

## Institute Admin Pages

### `InstituteDashboard` (`/admin`)
- Overview of institutional statistics (total students, owners, canteens, orders).
- Alerts for pending canteen owner applications.

### `OwnersApproval` (`/admin/owners`)
- Review and approve/reject canteen owner registrations within the institute.
- Access to owner profiles and FSSAI licenses.

---

## Auth & Onboarding

### `AuthPage` (`/auth`)
- **Multi-Institution Registration:**
    - **Institute Selection:** Users must pick their IIT from a dropdown (fetched from `/api/v1/institutions`).
    - **Role Selection:** Toggle between `STUDENT` and `CANTEEN_OWNER`.
    - **Dynamic Fields:** 
        - Students provide roll number, hostel, and room.
        - Owners provide their FSSAI license number.
- **Tiered Redirects:**
    - Students -> Welcome Student
    - Owners (Approved) -> Welcome Owner
    - Owners (Pending) -> Welcome Pending
    - Admins -> Admin Portal (separate dashboard)

### `WelcomePages`
Updated to personally greet users using their profile names (`user.student_profile.name` or `user.owner_profile.name`).
