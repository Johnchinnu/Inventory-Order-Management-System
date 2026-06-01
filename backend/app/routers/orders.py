from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from decimal import Decimal
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # Validate customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Validate all products and stock availability
    order_items_data = []
    total_amount = Decimal("0.00")

    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} not found"
            )
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.quantity}, Requested: {item.quantity}"
            )
        line_total = Decimal(str(product.price)) * item.quantity
        total_amount += line_total
        order_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })

    # Create order
    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(db_order)
    db.flush()  # Get order ID without committing

    # Create order items and deduct stock
    for item_data in order_items_data:
        db_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"]
        )
        db.add(db_item)
        # Deduct stock
        item_data["product"].quantity -= item_data["quantity"]

    db.commit()
    db.refresh(db_order)

    # Reload with relationships
    db_order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.order_items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == db_order.id)
        .first()
    )
    return db_order


@router.get("/", response_model=List[schemas.OrderResponse])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.order_items).joinedload(models.OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.order_items).joinedload(models.OrderItem.product)
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.order_items))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Restore stock on cancellation
    for item in order.order_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
