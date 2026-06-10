# API Endpoints Documentation

This document lists the primary API routes available in the BookIt backend.

---

## Auth (`/api/v1/auth`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user (Student or Owner) | Public |
| POST | `/login` | Authenticate and receive a JWT token | Public |
| GET | `/me` | Get current user profile | Authenticated |

## Canteens (`/api/v1/canteens`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/` | List all canteens, sorted by rating | Public |
| GET | `/{id}` | Get detailed canteen info | Public |
| POST | `/` | Create a new canteen | Owner |
| PATCH | `/{id}` | Update canteen details | Owner (Self) |
| POST | `/{id}/image` | Upload canteen banner | Owner (Self) |
| GET | `/{id}/reviews` | List reviews for a canteen | Public |
| POST | `/{id}/reviews` | Submit a review | Authenticated |

## Menu (`/api/v1/menu` & `/api/v1/canteens/{id}/menu`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/canteens/{id}/menu` | Get menu for a specific canteen | Public |
| POST | `/canteens/{id}/menu` | Add item to canteen menu | Owner (Self) |
| PATCH | `/menu/{id}` | Update menu item details | Owner (Self) |
| DELETE | `/menu/{id}` | Remove menu item | Owner (Self) |
| POST | `/menu/{id}/image` | Upload menu item image | Owner (Self) |
| GET | `/search?q={query}` | Search dishes across all canteens | Public |

## Orders (`/api/v1/orders`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/` | Place a new order | Student |
| GET | `/my` | List current student's orders | Student |
| GET | `/canteen/{id}` | List orders for a canteen | Owner (Self) |
| PUT | `/{id}/status` | Update order status & prep time | Owner (Self) |

## Admin (`/api/v1/admin`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/stats` | Platform-wide statistics | Admin |
| GET | `/owners` | List all canteen owners | Admin |
| PUT | `/owners/{id}/approve` | Approve a canteen owner | Admin |
| PUT | `/owners/{id}/reject` | Reject/Deactivate a canteen owner | Admin |
| GET | `/users` | List all registered users | Admin |
| GET | `/canteens` | List all canteens with owner details | Admin |
