from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.order import (
    BulkOrderCreate,
    OrderOut
)

from app.crud.order import (
    create_bulk_order,
    get_user_orders,
    get_all_orders,
    update_order_status
)

from app.auth.oauth import get_current_user

from app.dependencies.role_checker import admin_required


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# Place Order
# Supports single and multiple products

@router.post(
    "/",
    response_model=OrderOut,
    status_code=201
)
def place_order(

    order: BulkOrderCreate,

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user)
):

    return create_bulk_order(

        db,

        current_user.id,

        order
    )


# Get My Orders

@router.get(
    "/my-orders",
    response_model=list[OrderOut]
)
def get_my_orders(

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user)
):

    return get_user_orders(

        db,

        current_user.id
    )


# Admin Get All Orders

@router.get(
    "/all",
    response_model=list[OrderOut]
)
def get_all_orders_api(

    db: Session = Depends(get_db),

    current_user = Depends(admin_required)
):

    return get_all_orders(db)


# Update Order Status

@router.put(
    "/{order_id}/status"
)
def update_order_status_api(

    order_id: int,

    status: str,

    db: Session = Depends(get_db),

    current_user = Depends(admin_required)
):

    order = update_order_status(

        db,

        order_id,

        status
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "message": "Order status updated",
        "status": order.status
    }