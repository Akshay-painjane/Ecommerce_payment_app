from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from app.database import Base


class ReturnRequest(Base):

    __tablename__ = "returns"

    id = Column(
        Integer,
        primary_key=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id")
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    reason = Column(String)

    status = Column(
        String,
        default="PENDING"
    )