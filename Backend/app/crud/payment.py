from sqlalchemy.orm import Session

import razorpay

from fastapi import HTTPException

from app.models.payment import Payment
from app.models.order import Order
from app.models.user import User

from app.schemas.payment import PaymentCreate, PaymentVerify, PaymentMethod

from app.utils.email_service import send_email
from app.utils.razorpay_service import verify_payment_signature


def create_payment(
    db: Session,
    payment: PaymentCreate,
    user_id: int
):

    receipt_id = f"SS-{payment.order_id:06d}"

    db_payment = Payment(

        order_id=payment.order_id,

        user_id=user_id,

        amount=payment.amount,

        method=payment.method.value,

        status="success",

        gateway=payment.gateway or "cod",

        receipt_id=receipt_id
    )

    db.add(db_payment)

    # Update order status

    order = db.query(Order).filter(
        Order.id == payment.order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    order.status = "PAID"
    order.payment_status = "SUCCESS"

    db.commit()

    db.refresh(db_payment)

    # Send payment success email

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    send_email(

        user.email,

        "Payment Successful",

        f"""
        <h2>Hello {user.name}</h2>

        <p>Your payment was successful.</p>

        <p>Order ID: {payment.order_id}</p>

        <p>Payment Amount: ₹{payment.amount}</p>

        <p>Receipt ID: {receipt_id}</p>

        <p>Thank you for shopping with Style Store.</p>
        """
    )

    return db_payment


def verify_razorpay_payment(
    db: Session,
    payment: PaymentVerify,
    user_id: int
):

    order = db.query(Order).filter(
        Order.id == payment.order_id
    ).first()

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db_payment = db.query(Payment).filter(
        Payment.order_id == payment.order_id
    ).first()

    receipt_id = f"SS-{payment.order_id:06d}"

    if not db_payment:
        db_payment = Payment(
            order_id=payment.order_id,
            user_id=user_id,
            amount=order.total_price,
            method=payment.method.value,
            status="pending",
            gateway="razorpay",
            receipt_id=receipt_id
        )
        db.add(db_payment)

    db_payment.gateway_order_id = payment.gateway_order_id
    db_payment.gateway_payment_id = payment.gateway_payment_id
    db_payment.signature = payment.signature
    db_payment.method = payment.method.value
    db_payment.gateway = "razorpay"

    try:
        verify_payment_signature({
            "razorpay_order_id": payment.gateway_order_id,
            "razorpay_payment_id": payment.gateway_payment_id,
            "razorpay_signature": payment.signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay payment signature"
        )

    db_payment.status = "success"
    order.status = "PAID"
    order.payment_status = "SUCCESS"

    db.commit()
    db.refresh(db_payment)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    send_email(
        user.email,
        "Payment Successful",
        f"""
        <h2>Hello {user.name}</h2>

        <p>Your Razorpay payment was verified and completed successfully.</p>

        <p>Order ID: {payment.order_id}</p>

        <p>Payment Amount: ₹{db_payment.amount}</p>

        <p>Receipt ID: {receipt_id}</p>

        <p>Thank you for shopping with Style Store.</p>
        """
    )

    return db_payment