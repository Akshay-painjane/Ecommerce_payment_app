from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.order import Order
from app.models.user import User

from app.schemas.payment import PaymentCreate

from app.utils.email_service import send_email


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

        method=payment.method,

        status="success",

        receipt_id=receipt_id
    )

    db.add(db_payment)

    # Update order status

    order = db.query(Order).filter(
        Order.id == payment.order_id
    ).first()

    if order:

        order.status = "PAID"

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