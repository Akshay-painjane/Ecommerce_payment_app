from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.order import Order

from app.schemas.payment import PaymentCreate


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

    order = db.query(Order).filter(Order.id == payment.order_id).first()

    if order:
        order.status = "PAID"

    db.commit()

    db.refresh(db_payment)

    return db_payment
