from sqlalchemy.orm import Session

from app.models.return_request import ReturnRequest

from app.schemas.return_request import ReturnCreate


# Create Return Request

def create_return_request(
    db: Session,
    user_id: int,
    data: ReturnCreate
):

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

    db_return = db.query(ReturnRequest).filter(
        ReturnRequest.id == return_id
    ).first()

    if not db_return:

        return None

    db_return.status = status

    db.commit()

    db.refresh(db_return)

    return db_return