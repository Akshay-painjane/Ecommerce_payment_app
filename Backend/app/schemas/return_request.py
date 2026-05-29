from pydantic import BaseModel


class ReturnCreate(BaseModel):

    order_id: int

    reason: str


class ReturnOut(BaseModel):

    id: int

    order_id: int

    user_id: int

    reason: str

    status: str

    class Config:

        from_attributes = True