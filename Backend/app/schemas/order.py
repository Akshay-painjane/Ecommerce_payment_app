from pydantic import BaseModel

from app.schemas.order_item import OrderItemOut


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


class OrderOut(BaseModel):

    id: int

    user_id: int

    total_price: float

    status: str

    items: list[OrderItemOut]

    class Config:
        from_attributes = True