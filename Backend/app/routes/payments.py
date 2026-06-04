from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.payment import PaymentCreate, PaymentOut, PaymentVerify
from app.crud.payment import create_payment, verify_razorpay_payment
from app.auth.oauth import get_current_user

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

@router.post("/create", response_model=PaymentOut)
def create_new_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    return create_payment(
        db=db,
        payment=payment,
        user_id=current_user.id
    )


@router.post("/verify", response_model=PaymentOut)
def verify_payment(
    payment: PaymentVerify,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return verify_razorpay_payment(
        db=db,
        payment=payment,
        user_id=current_user.id
    )