from sqlalchemy.orm import Session

from fastapi import HTTPException

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.cart import Cart
from app.models.user import User
from app.models.payment import Payment

from app.schemas.order import BulkOrderCreate
from app.schemas.payment import PaymentMethod

from app.utils.email_service import send_email
from app.utils.razorpay_service import create_razorpay_order


# -----------------------------
# Create Order
# Supports single and multiple products
# -----------------------------

def create_order(
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

    payment_method = order.payment_method
    is_online_payment = payment_method != PaymentMethod.COD
    razorpay_order = None

    # Create order

    db_order = Order(

        user_id=user_id,

        total_price=total_price,

        status="PENDING",

        payment_status="PENDING" if is_online_payment else "SUCCESS"
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

    db_payment = Payment(

        order_id=db_order.id,

        user_id=user_id,

        amount=total_price,

        method=payment_method.value,

        status="pending" if is_online_payment else "success",

        gateway="razorpay" if is_online_payment else "cod",

        receipt_id=f"SS-{db_order.id:06d}"
    )

    if is_online_payment:
        razorpay_order = create_razorpay_order(total_price)
        db_payment.gateway_order_id = razorpay_order.get("id")

    db.add(db_payment)

    # Clear cart after successful order

    db.query(Cart).filter(
        Cart.user_id == user_id
    ).delete()

    db.commit()

    db.refresh(db_order)

    # Send order confirmation email

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    send_email(

        user.email,

        "Order Placed Successfully",

        f"""
        <h2>Hello {user.name}</h2>

        <p>Your order has been placed successfully.</p>

        <p>Order ID: {db_order.id}</p>

        <p>Total Amount: ₹{total_price}</p>

        <p>Thank you for shopping with Style Store.</p>
        """
    )

    return {
        "order": db_order,
        "razorpay_order": razorpay_order
    }


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

    # Get user

    user = db.query(User).filter(
        User.id == order.user_id
    ).first()

    # Send status update email

    send_email(

        user.email,

        f"Order {status}",

        f"""
        <h2>Hello {user.name}</h2>

        <p>Your order status has been updated.</p>

        <p>Order ID: {order.id}</p>

        <p>Current Status: {status}</p>

        <p>Thank you for shopping with Style Store.</p>
        """
    )

    return order