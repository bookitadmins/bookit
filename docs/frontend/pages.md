# Frontend Pages Documentation

Detailed description of the page components in the frontend.

---

## Student Pages

### `Dashboard` (`/`)
The main entry point for students.
- Lists all available canteens.
- Supports sorting by rating (ascending/descending).
- Displays canteen cards with names, images, and current ratings.

### `PriceComparison` (`/search`)
The "Price Finder" feature.
- Allows students to search for any dish name.
- Queries the backend to find all menu items across all canteens matching the query.
- Displays results sorted by price (cheapest first) for easy comparison.

### `CanteenDetail` (`/canteen/:id`)
Detailed view of a single canteen.
- Shows canteen description and banner.
- Displays the full menu grouped by categories (e.g., "Breakfast", "Lunch").
- **Cart Management:** Allows adding/removing items and adjusting quantities.
- **Checkout:** Allows adding notes and placing an order.
- **Reviews:** Displays existing reviews and allows students to submit their own rating and comment.

### `OrderHistory` (`/orders`)
- Lists all orders placed by the student.
- Shows current status (e.g., "Preparing", "Ready in 5 min").
- Real-time updates via WebSockets ensure the status is always current without refreshing.

---

## Owner Pages

### `OwnerDashboard` (`/owner`)
The mission control for canteen owners.
- **Live Order Ticker:** Automatically updates when a new order is received via WebSockets.
- Lists all active and past orders for the owner's canteen.

### `OrderFulfillment` (`/owner/order/:id`)
Detailed view for processing an order.
- Shows customer details, items ordered, and special notes.
- **Status Management:** Owners can update the status to "Preparing", "Ready in 5", "Completed", or "Cancelled".
- **Prep Time:** Allows owners to set an estimated preparation time when moving to "Preparing".

### `MenuEditor` (`/owner/menu`)
- Allows owners to add new menu items.
- Edit existing item details (name, description, price, category, availability).
- Upload item photos.
- Toggle item availability (out-of-stock items are hidden from students).

---

## Auth & Onboarding

### `AuthPage` (`/auth`)
- Unified interface for Login and Registration.
- Form validation and error handling (e.g., "Email already registered").

### `WelcomePages`
- **`WelcomeStudent`**: Post-registration onboarding for students.
- **`WelcomeOwner`**: Onboarding for owners, informing them about the approval process.
- **`WelcomePending`**: A "holding" page for owners whose accounts have not yet been approved by an admin.
