from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey
)

from app.database import Base


class Payment(Base):

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    amount = Column(Float)

    status = Column(
        String,
        default="pending"
    )