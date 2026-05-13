from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.payment import (
    PaymentCreate,
    PaymentOut
)

from app.crud.payment import create_payment

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post(
    "/",
    response_model=PaymentOut
)
def create_new_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_payment(
    db,
    payment,
    current_user.id
)