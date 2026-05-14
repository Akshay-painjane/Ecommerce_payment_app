from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.order import (
    SingleOrderCreate,
    BulkOrderCreate,
    OrderOut
)

from app.crud.order import (
    create_single_order,
    create_bulk_order
)

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# Single product order

@router.post(
    "/single",
    response_model=OrderOut,
    status_code=201
)
def place_single_order(
    order: SingleOrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_single_order(
        db,
        current_user.id,
        order
    )


@router.post(
    "/bulk",
    response_model=OrderOut,
    status_code=201
)
def place_bulk_order(
    order: BulkOrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return create_bulk_order(
        db,
        current_user.id,
        order
    )
