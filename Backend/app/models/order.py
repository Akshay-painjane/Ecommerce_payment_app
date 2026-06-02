from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    total_price = Column(Float)

    status = Column(
        String,
        default="PENDING"
    )

    payment_status = Column(
        String,
        default="PENDING"
    )

    items = relationship(
        "OrderItem",
        backref="order"
    )