from pydantic import BaseModel


class PaymentCreate(BaseModel):

    order_id: int

    amount: float

    method: str = "Cash on Delivery"


class PaymentOut(BaseModel):

    id: int

    order_id: int

    amount: float

    status: str

    method: str

    receipt_id: str | None = None

    class Config:
        from_attributes = True
