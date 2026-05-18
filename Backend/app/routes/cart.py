from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.cart import (
    CartCreate,
    CartOut,
    BulkCartCreate
)

from app.crud.cart import (
    add_to_cart,
    get_user_cart,
    bulk_add_to_cart,
    remove_from_cart
)

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


# Add single product to cart

@router.post(
    "",
    response_model=CartOut
)
@router.post(
    "/",
    response_model=CartOut
)
def add_product_to_cart(
    cart: CartCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return add_to_cart(
        db,
        current_user.id,
        cart
    )


# Add multiple products to cart

@router.post("/bulk")
def bulk_cart_add(
    data: BulkCartCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return bulk_add_to_cart(
        db,
        current_user.id,
        data.items
    )


# Get user cart

@router.get(
    "",
    response_model=list[CartOut]
)
@router.get(
    "/",
    response_model=list[CartOut]
)
def get_cart(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_user_cart(
        db,
        current_user.id
    )


@router.delete("/{cart_id}")
def delete_cart_item(
    cart_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    deleted = remove_from_cart(
        db,
        current_user.id,
        cart_id
    )

    if not deleted:
        return {
            "message": "Cart item not found"
        }

    return {
        "message": "Cart item removed"
    }
