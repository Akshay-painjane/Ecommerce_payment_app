from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from Backend.app.database import get_db

from Backend.app.schemas.payment import (
    PaymentCreate,
    PaymentOut
)

from Backend.app.crud.payment import create_payment

from Backend.app.auth.oauth import get_current_user


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
        payment
    )