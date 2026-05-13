from pydantic import BaseModel


class ProductCreate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int

    image_url: str | None = None


class ProductUpdate(BaseModel):

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int

    image_url: str | None = None


class ProductOut(BaseModel):

    id: int

    name: str

    description: str | None = None

    price: float

    stock: int

    category_id: int

    image_url: str | None = None

    class Config:
        from_attributes = True