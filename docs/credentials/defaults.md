# Default Development Credentials

> ⚠️ **IMPORTANT:** These credentials are for **local development and testing only**. Never use these in a production environment. Always change secrets and passwords before deploying.

## 🌐 Deployment Configuration
- **Server IP:** `localhost` (Configurable via `SERVER_IP` and `VITE_SERVER_IP` in `.env`)
- **Frontend URL:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5174`
- **Backend API:** `http://localhost:8000`
- **WebSocket:** `ws://localhost:8000`

## 🔑 Platform Admin (BookIt Admin)
These credentials are used to log in to the **Admin Dashboard**.

- **Email:** `admin@bookit.app`
- **Password:** `admin123`

## 🐘 Database (PostgreSQL)
- **Username:** `bookit_admin`
- **Password:** `secure_password_123`
- **Database:** `bookit_db`
- **Port:** `5432`

## 📦 Object Storage (MinIO)
- **Access Key (User):** `minio_admin`
- **Secret Key (Password):** `minio_secure_password`
- **Console Port:** `9001`
- **API Port:** `9000`

## 🛡️ Security Keys
- **JWT Secret:** `change_this_to_a_long_random_string_in_production` (Default in `.env.example`)
