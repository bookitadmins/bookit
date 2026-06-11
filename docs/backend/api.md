# API Endpoints Documentation

This document lists the primary API routes available in the BookIt backend.

---

## Auth (`/api/v1/auth`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/register` | Register User + Profile (Student/Owner) | Public |
| POST | `/login` | Authenticate & get JWT (includes institute_id) | Public |
| GET | `/me` | Get current user with full profile | Authenticated |

## Institutions (`/api/v1/institutions`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/` | List all institutions for registration | Public |
| POST | `/` | Create a new institution | Super Admin |
| PATCH | `/{id}` | Update institution details | Super Admin |
| DELETE | `/{id}` | Remove an institution | Super Admin |

## Canteens (`/api/v1/canteens`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/` | List canteens in your institute | Authenticated |
| GET | `/{id}` | Get detailed canteen info | Public |
| POST | `/` | Create a new canteen (auto-linked to institute) | Owner |
| PATCH | `/{id}` | Update canteen details | Owner (Self) |

## Menu (`/api/v1/menu` & `/api/v1/canteens/{id}/menu`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/canteens/{id}/menu` | Get menu for a canteen | Public |
| GET | `/search?q={query}` | Search dishes within your institute | Student |

## Admin (`/api/v1/admin`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/global-stats` | Platform-wide overview | Super Admin |
| GET | `/institute-stats` | Local institute overview | Institute Admin |
| GET | `/owners` | List owners in your institute | Institute Admin |
| PUT | `/owners/{id}/approve` | Approve owner in your institute | Institute Admin |
| PATCH | `/users/{id}/toggle-disabled` | Deactivate any user account | Super Admin |
