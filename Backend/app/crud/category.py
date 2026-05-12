from sqlalchemy.orm import Session

from Backend.app.models.category import Category

from Backend.app.schemas.category import CategoryCreate


def create_category(
    db: Session,
    category: CategoryCreate
):

    db_category = Category(
        name=category.name
    )

    db.add(db_category)

    db.commit()

    db.refresh(db_category)

    return db_category


def get_categories(db: Session):

    return db.query(Category).all()