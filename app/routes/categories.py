from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.category import (
    CategoryCreate,
    CategoryOut
)

from app.crud.category import (
    create_category,
    get_categories
)

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post(
    "/",
    response_model=CategoryOut
)
def create_new_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_category(
        db,
        category
    )


@router.get(
    "/",
    response_model=list[CategoryOut]
)
def get_all_categories(
    db: Session = Depends(get_db)
):

    return get_categories(db)