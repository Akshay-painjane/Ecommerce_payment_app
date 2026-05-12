from sqlalchemy import (
    Column,
    Integer,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from Backend.app.database import Base


class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    total_price = Column(Float)

    items = relationship(
        "OrderItem",
        backref="order"
    )