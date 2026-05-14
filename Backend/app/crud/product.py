from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category

from app.schemas.product import (
    ProductCreate,
    ProductUpdate
)


def create_product(
    db: Session,
    product: ProductCreate
):

    # check category exists
    category = db.query(Category).filter(
        Category.id == product.category_id
    ).first()

    if not category:
        return None

    db_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        category_id=product.category_id
    )

    db.add(db_product)

    db.commit()

    db.refresh(db_product)

    return db_product


def get_all_products(db: Session):

    return db.query(Product).all()


def get_product_by_id(
    db: Session,
    product_id: int
):

    return db.query(Product).filter(
        Product.id == product_id
    ).first()


def update_product(
    db: Session,
    product_id: int,
    product: ProductUpdate
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not db_product:
        return None

    # validate category if provided
    if product.category_id is not None:

        category = db.query(Category).filter(
            Category.id == product.category_id
        ).first()

        if not category:
            return None

        db_product.category_id = product.category_id

    if product.name is not None:
        db_product.name = product.name

    if product.description is not None:
        db_product.description = product.description

    if product.price is not None:
        db_product.price = product.price

    if product.stock is not None:
        db_product.stock = product.stock

    db.commit()

    db.refresh(db_product)

    return db_product


def delete_product(
    db: Session,
    product_id: int
):

    db_product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not db_product:
        return None

    db.delete(db_product)

    db.commit()

    return db_product
