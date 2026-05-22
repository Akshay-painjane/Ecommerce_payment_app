from pydantic import BaseModel


class CategoryCreate(BaseModel):

    name: str

    description: str | None = None

    image_url: str | None = None


class CategoryOut(BaseModel):

    id: int

    name: str

    description: str | None = None

    image_url: str | None = None

    class Config:
        from_attributes = True