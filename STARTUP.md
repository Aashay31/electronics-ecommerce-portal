# ElectroMart — Startup Guide

## Prerequisites

| Tool        | Version  | Download                                                  |
| ----------- | -------- | --------------------------------------------------------- |
| Node.js     | v18+     | https://nodejs.org/                                       |
| npm         | v9+      | Comes with Node.js                                        |
| MongoDB     | Atlas    | https://cloud.mongodb.com/ (cloud, no local install)      |
| Redis       | v7+      | See [Redis Setup](#3-start-redis) below                   |
| Git         | v2+      | https://git-scm.com/                                      |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Aashay31/electronics-ecommerce-portal.git
cd electronics-ecommerce-portal
```

---

## 2. Environment Setup

### Backend `.env`

Create `backend/.env` (use `backend/.env.example` as reference):

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=Emart

# Server
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=ElectroMart
FRONTEND_URL=http://localhost:5173

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Redis (optional — app works without it)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

> **Note:** Redis is optional. If Redis is not running, the app silently falls back to MongoDB for all data — no crashes, no errors.

---

## 3. Start Redis

Redis is used for caching frequently accessed product data and AI chat responses. Pick one method:

### Option A — Docker (Recommended)

```bash
docker run -d --name redis -p 6379:6379 redis
```

### Option B — Windows Native

1. Download from https://github.com/tporadowski/redis/releases
2. Install and start the Redis service
3. Verify:

```bash
redis-cli ping
# Expected output: PONG
```

### Option C — WSL (Windows Subsystem for Linux)

```bash
sudo apt update
sudo apt install redis-server
sudo service redis-server start
redis-cli ping
# Expected output: PONG
```

### Option D — Skip Redis Entirely

Don't install or start Redis. The app will log `Redis connection error` to the console but **work perfectly** using MongoDB directly.

---

## 4. Install Dependencies

Open **two terminals** — one for backend, one for frontend.

### Terminal 1 — Backend

```bash
cd backend
npm install
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
```

---

## 5. Start the Application

### Terminal 1 — Start Backend

```bash
cd backend
npm start
```

**Expected output:**

```
Server running on port 5000
Redis connected successfully        ← (only if Redis is running)
MongoDB Connected Successfully
```

### Terminal 2 — Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**

```
VITE v8.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

---

## 6. Access the Application

| Page           | URL                          |
| -------------- | ---------------------------- |
| Homepage       | http://localhost:5173         |
| Products       | http://localhost:5173/products|
| Admin Panel    | http://localhost:5173/admin   |
| API Server     | http://localhost:5000         |

---

## Quick Start (All Commands)

```bash
# 1. Clone
git clone https://github.com/Aashay31/electronics-ecommerce-portal.git
cd electronics-ecommerce-portal

# 2. Start Redis (pick one)
docker run -d --name redis -p 6379:6379 redis    # Docker
# OR skip this step — Redis is optional

# 3. Backend
cd backend
npm install
npm start

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

---

## Useful Redis Commands

```bash
# Check if Redis is running
redis-cli ping                         # → PONG

# View all cached keys
redis-cli KEYS "*"

# View product cache keys
redis-cli KEYS "products:*"

# View chat cache keys
redis-cli KEYS "chat:*"

# Clear all cache
redis-cli FLUSHALL

# Check TTL of a key
redis-cli TTL "products:list:{}"

# Stop Redis (Docker)
docker stop redis

# Start Redis (Docker)
docker start redis
```

---

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| `Redis connection error: connect ECONNREFUSED` | Redis is not running. Start it or ignore — app works without it |
| `MongoDB connection failed` | Check `MONGO_URI` in `.env` and your network/VPN |
| `Port 5000 already in use` | Kill the process: `npx kill-port 5000` or change `PORT` in `.env` |
| `Port 5173 already in use` | Kill the process: `npx kill-port 5173` |
| `CORS errors in browser` | Ensure `FRONTEND_URL` in `.env` matches your frontend URL |
| `Email not sending` | Use a Gmail App Password (not your regular password) |
| `Razorpay errors` | Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env` |

---

## Tech Stack

| Layer     | Technology                                           |
| --------- | ---------------------------------------------------- |
| Frontend  | React 19, Vite, Tailwind CSS, React Router, Axios    |
| Backend   | Node.js, Express 5, Mongoose, Socket.IO              |
| Database  | MongoDB Atlas                                        |
| Cache     | Redis (via ioredis)                                  |
| AI        | Groq SDK (LLaMA 3.3 70B)                            |
| Payments  | Razorpay                                             |
| Email     | Nodemailer (Gmail SMTP)                              |
