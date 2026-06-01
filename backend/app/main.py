from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import products, customers, orders, dashboard
import os

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockInv — Inventory & Order Management API",
    description="Production-ready API for managing products, customers, and orders.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
origins = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For deployment flexibility; restrict to origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "StockInv API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
