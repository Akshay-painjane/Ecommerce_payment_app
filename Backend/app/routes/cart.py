from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.cart import (

    CartCreate,

    CartOut,

    CartUpdate
)

from app.crud.cart import (

    add_to_cart,

    get_user_cart,

    remove_from_cart,

    update_cart_item
)

from app.auth.oauth import get_current_user


router = APIRouter(

    prefix="/cart",

    tags=["Cart"]
)


# Add product to cart

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


# Get user cart

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


# Update cart quantity

@router.put(

    "/{cart_id}",

    response_model=CartOut
)
def update_cart(

    cart_id: int,

    cart: CartUpdate,

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user)
):

    updated_cart = update_cart_item(

        db,

        current_user.id,

        cart_id,

        cart.quantity
    )

    if not updated_cart:

        return {
            "message": "Cart item not found"
        }

    return updated_cart


# Delete cart item

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