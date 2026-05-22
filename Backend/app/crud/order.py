from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.cart import Cart

from app.schemas.order import (
    SingleOrderCreate,
    BulkOrderCreate
)


# -----------------------------
# Single Product Order
# -----------------------------

def create_single_order(
    db: Session,
    user_id: int,
    order: SingleOrderCreate
):

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product.stock < order.quantity:

        raise HTTPException(
            status_code=400,
            detail="Out of stock"
        )

    total_price = (
        product.price * order.quantity
    )

    # Create order

    db_order = Order(
        user_id=user_id,
        total_price=total_price,
        status="PENDING"
    )

    db.add(db_order)

    db.commit()

    db.refresh(db_order)

    # Reduce stock

    product.stock -= order.quantity

    # Create order item

    order_item = OrderItem(
        order_id=db_order.id,
        product_id=product.id,
        quantity=order.quantity,
        price=product.price
    )

    db.add(order_item)

    # Remove ordered product from cart

    db.query(Cart).filter(
        Cart.user_id == user_id,
        Cart.product_id == product.id
    ).delete()

    db.commit()

    db.refresh(db_order)

    return db_order


# -----------------------------
# Bulk Product Order
# -----------------------------

def create_bulk_order(
    db: Session,
    user_id: int,
    order: BulkOrderCreate
):

    total_price = 0

    # Validate stock

    for item in order.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:

            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        if product.stock < item.quantity:

            raise HTTPException(
                status_code=400,
                detail=f"{product.name} out of stock"
            )

        total_price += (
            product.price * item.quantity
        )

    # Create order

    db_order = Order(
        user_id=user_id,
        total_price=total_price,
        status="PENDING"
    )

    db.add(db_order)

    db.commit()

    db.refresh(db_order)

    # Create order items

    for item in order.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        # Reduce stock

        product.stock -= item.quantity

        # Create order item

        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

    # Clear cart after successful order

    db.query(Cart).filter(
        Cart.user_id == user_id
    ).delete()

    db.commit()

    db.refresh(db_order)

    return db_order


# -----------------------------
# Get Single Order
# -----------------------------

def get_single_order(
    db: Session,
    order_id: int
):

    return db.query(Order).filter(
        Order.id == order_id
    ).first()


# -----------------------------
# Get User Orders
# -----------------------------

def get_user_orders(
    db: Session,
    user_id: int
):

    return db.query(Order).filter(
        Order.user_id == user_id
    ).all()


# -----------------------------
# Get All Orders
# -----------------------------

def get_all_orders(
    db: Session
):

    return db.query(Order).all()


# -----------------------------
# Update Order Status
# -----------------------------

def update_order_status(
    db: Session,
    order_id: int,
    status: str
):

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:

        return None

    order.status = status

    db.commit()

    db.refresh(order)

    return order