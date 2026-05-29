from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey,
    DateTime
)

from datetime import datetime

from app.database import Base


class Payment(Base):

    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    amount = Column(Float)

    # pending/success/failed/refunded
    status = Column(
        String,
        default="pending"
    )

    # razorpay / phonepe / cod
    gateway = Column(
        String,
        default="cod"
    )

    # UPI / Card / COD etc
    method = Column(
        String,
        default="Cash on Delivery"
    )

    # Razorpay Order ID
    gateway_order_id = Column(
        String,
        nullable=True
    )

    # Razorpay Payment ID
    gateway_payment_id = Column(
        String,
        nullable=True
    )

    # Signature verification
    signature = Column(
        String,
        nullable=True
    )

    receipt_id = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )