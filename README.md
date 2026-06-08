# Book It 🍽️ — Campus Food Pre-Booking Platform

A full-stack web application connecting campus residents and students with on-campus canteens. Pre-book food, compare prices across canteens, and get real-time notifications when your order is ready.

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT-based login/register with role selection |
| 🏪 **Canteen Listings** | Browse and sort canteens by rating |
| 🔍 **Price Finder** | Search any dish — compare prices across all canteens instantly |
| 📋 **Menu Browsing** | Category-grouped menus with cart management |
| 🛒 **Pre-Booking** | Place orders with item quantities and notes |
| 🔔 **Real-time Alerts** | WebSocket-powered live order status updates |
| 👨‍🍳 **Owner Dashboard** | Live incoming order ticker with status management |
| ⏱️ **Prep Time** | Owners set prep time; "Ready in 5 min" notice auto-alerts students |
| 📸 **Image Uploads** | MinIO-backed canteen banners and food photos |
| ⭐ **Reviews** | Students rate canteens after ordering |

## 🏗️ Architecture

```
Frontend (React + Vite)  ←→  Backend (FastAPI)  ←→  PostgreSQL
      Port 5173                   Port 8000            Port 5432
                                     ↕
                                   MinIO
                              Ports 9000/9001
```

## 🚀 Quick Start (Docker Compose)

```bash
# 1. Clone and navigate
cd bookit

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker compose up --build

# Services:
# Frontend  → http://localhost:5173
# Backend   → http://localhost:8000
# API Docs  → http://localhost:8000/docs
# MinIO UI  → http://localhost:9001
```

## 🛠️ Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtualenv
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or copy .env.example to backend/.env)
export DATABASE_URL="postgresql+asyncpg://bookit_admin:secure_password_123@localhost:5432/bookit_db"
export JWT_SECRET="change_this_in_production"

# Run
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
# → http://localhost:5173
```

## 📊 Database Schema

- **Users** — Email, hashed password, role (student_resident / canteen_owner), name, phone
- **Canteens** — Owner, name, banner image, rating (auto-updated from reviews)
- **MenuItems** — Name, price, category, image, availability toggle
- **Orders** — User, canteen, status, prep time, items, total
- **OrderItems** — Snapshot of item name/price at order time
- **Reviews** — 1–5 star rating + comment, drives canteen rating average

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/canteens` | List all canteens (sort by rating) |
| GET | `/api/v1/canteens/{id}/menu` | Get canteen menu |
| GET | `/api/v1/search?q=dish` | Cross-canteen price comparison |
| POST | `/api/v1/orders` | Place an order |
| PUT | `/api/v1/orders/{id}/status` | Update order status (triggers WS notification) |
| WS | `/ws/{user_id}?token=...` | Real-time notification channel |

Full interactive docs at `/docs` when the backend is running.

## 🐳 Docker Services

| Service | Image | Port |
|---|---|---|
| `postgres` | postgres:15-alpine | 5432 |
| `minio` | minio/minio | 9000, 9001 |
| `backend` | ./backend | 8000 |
| `frontend` | ./frontend | 5173 |

## 🔑 Default Credentials (dev)

- **PostgreSQL**: `bookit_admin` / `secure_password_123`
- **MinIO**: `minio_admin` / `minio_secure_password`

> ⚠️ Change all credentials before any production deployment!