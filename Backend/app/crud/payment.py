from sqlalchemy.orm import Session

from Backend.app.models.payment import Payment

from Backend.app.schemas.payment import PaymentCreate


def create_payment(
    db: Session,
    payment: PaymentCreate
):

    db_payment = Payment(
        order_id=payment.order_id,
        amount=payment.amount
    )

    db.add(db_payment)

    db.commit()

    db.refresh(db_payment)

    return db_payment