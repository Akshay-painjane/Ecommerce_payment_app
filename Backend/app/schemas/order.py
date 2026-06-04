from typing import Any

from pydantic import BaseModel

from app.schemas.order_item import OrderItemOut
from app.schemas.payment import PaymentMethod


# Single order product

class SingleOrderCreate(BaseModel):

    product_id: int

    quantity: int


# Bulk order product

class OrderProduct(BaseModel):

    product_id: int

    quantity: int


class BulkOrderCreate(BaseModel):

    items: list[OrderProduct]
    payment_method: PaymentMethod = PaymentMethod.COD


class OrderOut(BaseModel):

    id: int

    user_id: int

    total_price: float

    status: str

    items: list[OrderItemOut]

    class Config:
        from_attributes = True


class OrderCreateResponse(BaseModel):

    order: OrderOut

    razorpay_order: dict[str, Any] | None = None