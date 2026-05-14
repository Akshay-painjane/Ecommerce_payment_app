from pydantic import BaseModel


class CartCreate(BaseModel):

    product_id: int

    quantity: int


class BulkCartCreate(BaseModel):

    items: list[CartCreate]


class CartOut(BaseModel):

    id: int

    user_id: int

    product_id: int

    quantity: int

    class Config:
        from_attributes = True
