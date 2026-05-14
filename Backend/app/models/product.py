from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    description = Column(String, nullable=True)

    price = Column(Float, nullable=False)

    stock = Column(Integer, default=0)

    # Foreign Key
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    # Product image
    image_url = Column(String, nullable=True)


    # relationship with Category
    category = relationship("Category", back_populates="products")