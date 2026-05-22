from sqlalchemy.orm import Session

from app.models.category import Category

from app.schemas.category import CategoryCreate


def create_category(
    db: Session,
    category: CategoryCreate
):

    db_category = Category(

        name=category.name,

        description=category.description,

        image_url=category.image_url
    )

    db.add(db_category)

    db.commit()

    db.refresh(db_category)

    return db_category


def get_categories(
    db: Session
):

    return db.query(Category).all()


def get_category_by_id(
    db: Session,
    category_id: int
):

    return db.query(Category).filter(
        Category.id == category_id
    ).first()


def update_category(
    db: Session,
    category_id: int,
    category: CategoryCreate
):

    db_category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not db_category:

        return None

    db_category.name = category.name

    db_category.description = category.description

    db_category.image_url = category.image_url

    db.commit()

    db.refresh(db_category)

    return db_category


def delete_category(
    db: Session,
    category_id: int
):

    db_category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not db_category:

        return None

    db.delete(db_category)

    db.commit()

    return db_category