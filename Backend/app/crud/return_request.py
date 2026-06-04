from sqlalchemy.orm import Session

from app.models.return_request import ReturnRequest

from app.schemas.return_request import ReturnCreate

from app.models.order import Order

# Create Return Request

def create_return_request(
    db: Session,
    user_id: int,
    data: ReturnCreate
):
    order = db.query(Order).filter(
    Order.id == data.order_id
    ).first()

    if not order:
        return None
    if order.user_id != user_id:
        return "NOT_OWNER"
    if order.payment_status != "PAID":
        return "PAYMENT_PENDING"
    if order.status != "DELIVERED":
        return "NOT_DELIVERED"
    existing_return = db.query(ReturnRequest).filter(
    ReturnRequest.order_id == data.order_id
    ).first()

    if existing_return:
        return "RETURN_ALREADY_EXISTS"
    db_return = ReturnRequest(

        order_id=data.order_id,

        user_id=user_id,

        reason=data.reason
    )

    db.add(db_return)

    db.commit()

    db.refresh(db_return)

    return db_return


# Get User Returns

def get_user_returns(
    db: Session,
    user_id: int
):

    return db.query(ReturnRequest).filter(
        ReturnRequest.user_id == user_id
    ).all()


# Admin Update Return Status

def update_return_status(
    db: Session,
    return_id: int,
    status: str
):

    allowed_statuses = [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "REFUNDED"
    ]

    if status not in allowed_statuses:
        return "INVALID_STATUS"

    db_return = db.query(ReturnRequest).filter(
        ReturnRequest.id == return_id
    ).first()

    if not db_return:
        return None

    db_return.status = status

    db.commit()

    db.refresh(db_return)

    return db_return