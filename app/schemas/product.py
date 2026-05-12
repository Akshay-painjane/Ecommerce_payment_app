from pydantic import BaseModel


class ProductCreate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int


class ProductUpdate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int


class ProductOut(BaseModel):

    id: int

    name: str

    description: str | None = None

    price: float

    stock: int

    class Config:
        from_attributes = True