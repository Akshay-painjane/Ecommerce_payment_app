from pydantic import BaseModel


class ProductCreate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int


class ProductUpdate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int


class ProductOut(BaseModel):

    id: int

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int

    class Config:
        from_attributes = True
