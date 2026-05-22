from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.wishlist import (
    WishlistCreate,
    WishlistOut
)

from app.crud.wishlist import (
    add_to_wishlist,
    get_user_wishlist,
    remove_from_wishlist
)

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


# Add to wishlist

@router.post(
    "/",
    response_model=WishlistOut
)
def add_product_to_wishlist(
    wishlist: WishlistCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return add_to_wishlist(
        db,
        current_user.id,
        wishlist
    )


# Get wishlist

@router.get(
    "/",
    response_model=list[WishlistOut]
)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    return get_user_wishlist(
        db,
        current_user.id
    )


# Remove wishlist item

@router.delete("/{wishlist_id}")
def delete_wishlist_item(
    wishlist_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    deleted = remove_from_wishlist(
        db,
        wishlist_id,
        current_user.id
    )

    if not deleted:

        raise HTTPException(
            status_code=404,
            detail="Wishlist item not found"
        )

    return {
        "message": "Wishlist item removed"
    }