from pydantic import BaseModel
from decimal import Decimal
from enum import Enum


class PaymentMethod(str, Enum):
    COD = "Cash on Delivery"
    CARD = "Card"
    UPI = "UPI"


class PaymentCreate(BaseModel):

    order_id: int
    amount: Decimal
    method: PaymentMethod = PaymentMethod.COD


class PaymentOut(BaseModel):

    id: int
    order_id: int
    amount: Decimal
    status: str
    method: PaymentMethod
    receipt_id: str | None = None

    class Config:
        from_attributes = True