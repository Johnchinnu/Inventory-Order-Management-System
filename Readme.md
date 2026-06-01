# StockInv — Inventory & Order Management System

A production-ready, full-stack Inventory & Order Management System built with **React**, **FastAPI**, **PostgreSQL**, and fully containerized with **Docker**.

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://stockinv.vercel.app *(update after deploy)* |
| **Backend API** | https://stockinv-api.onrender.com *(update after deploy)* |
| **API Docs** | https://stockinv-api.onrender.com/docs |
| **Docker Hub** | https://hub.docker.com/r/YOUR_USERNAME/stockinv-backend |

---

## 🏗️ Architecture

```
┌─────────────────┐     HTTP      ┌─────────────────┐     SQL      ┌──────────────┐
│  React Frontend │ ──────────→  │  FastAPI Backend │ ──────────→ │  PostgreSQL  │
│   (Vite + Axios)│              │  (Python 3.11)   │             │  Database    │
│   Port: 3000    │              │   Port: 8000     │             │  Port: 5432  │
└─────────────────┘              └─────────────────┘             └──────────────┘
```

---

## 📋 Features

### Product Management
- ✅ Create, read, update, delete products
- ✅ SKU uniqueness enforced
- ✅ Stock quantity validation (no negatives)
- ✅ Low stock alerts (≤10 units)

### Customer Management
- ✅ Create, read, delete customers
- ✅ Email uniqueness enforced
- ✅ Customer avatar initials

### Order Management
- ✅ Create multi-item orders
- ✅ Automatic stock deduction on order creation
- ✅ Stock restoration on order cancellation
- ✅ Calculated total amount
- ✅ Full order detail view

### Dashboard
- ✅ Total products, customers, orders, revenue
- ✅ Low stock alerts widget
- ✅ Quick action links

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, React Router |
| Styling | Vanilla CSS (dark glassmorphism theme) |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## ⚡ Quick Start with Docker

### Prerequisites
- Docker Desktop installed → [Download here](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/stockinv.git
cd stockinv
```

### 2. Configure Environment
```bash
# Copy and edit environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Run with Docker Compose
```bash
docker compose up --build
```

### 4. Access the Application
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## 🔧 Local Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Environment Variables

### Root `.env`
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stockinv_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

DATABASE_URL=postgresql://postgres:your_password@localhost:5432/stockinv_db
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/customers` | Create customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create order (deducts stock) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order details |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Get summary statistics |

---

## 🐳 Docker Commands

```bash
# Build and start all services
docker compose up --build

# Run in background
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (reset DB)
docker compose down -v

# View logs
docker compose logs -f backend

# Build backend image for Docker Hub
docker build -t YOUR_USERNAME/stockinv-backend ./backend
docker push YOUR_USERNAME/stockinv-backend
```

---

## 🚀 Deployment Guide

### Backend → Render.com
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repository
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variable: `DATABASE_URL` (from Render's PostgreSQL add-on)
5. Deploy → copy the URL

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect GitHub repository
3. Set:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Environment Variable**: `VITE_API_URL=https://YOUR_RENDER_URL`
4. Deploy

---

## 📁 Project Structure

```
stockinv/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS
│   │   ├── database.py      # SQLAlchemy engine
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios client
│   │   ├── components/      # Sidebar, Navbar, StatCard
│   │   ├── pages/           # Dashboard, Products, Customers, Orders
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Design system
│   ├── Dockerfile
│   ├── .dockerignore
│   └── nginx.conf
├── docker-compose.yml
├── .env
├── .dockerignore
└── README.md
```

---

## 📜 License
MIT License — Free to use and modify.
