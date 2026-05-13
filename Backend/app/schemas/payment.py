from pydantic import BaseModel


class PaymentCreate(BaseModel):

    order_id: int

    amount: float


class PaymentOut(BaseModel):

    id: int

    order_id: int

    amount: float

    status: str

    class Config:
        from_attributes = True
