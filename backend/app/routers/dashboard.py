from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=schemas.DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total_products = db.query(func.count(models.Product.id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.id)).scalar() or 0
    total_orders = db.query(func.count(models.Order.id)).scalar() or 0

    total_revenue_result = db.query(func.sum(models.Order.total_amount)).scalar()
    total_revenue = Decimal(str(total_revenue_result)) if total_revenue_result else Decimal("0.00")

    # Low stock = quantity <= 10
    low_stock_products = (
        db.query(models.Product)
        .filter(models.Product.quantity <= 10)
        .order_by(models.Product.quantity.asc())
        .limit(10)
        .all()
    )

    return schemas.DashboardStats(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock_products
    )
