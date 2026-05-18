from pydantic import BaseModel

from app.schemas.product import ProductOut


class CartCreate(BaseModel):

    product_id: int

    quantity: int

    product: ProductOut | None = None


class BulkCartCreate(BaseModel):

    items: list[CartCreate]


class CartOut(BaseModel):

    id: int

    user_id: int

    product_id: int

    quantity: int

    class Config:
        from_attributes = True
