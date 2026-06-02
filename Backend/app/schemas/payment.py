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
    method: PaymentMethod
    gateway: str | None = None


class PaymentVerify(BaseModel):

    order_id: int
    gateway_order_id: str
    gateway_payment_id: str
    signature: str
    method: PaymentMethod = PaymentMethod.CARD


class PaymentOut(BaseModel):

    id: int
    order_id: int
    amount: Decimal
    status: str
    method: PaymentMethod
    gateway: str | None = None
    gateway_order_id: str | None = None
    gateway_payment_id: str | None = None
    receipt_id: str | None = None

    class Config:
        from_attributes = True