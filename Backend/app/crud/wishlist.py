from sqlalchemy.orm import Session

from app.models.wishlist import Wishlist

from app.schemas.wishlist import WishlistCreate


def add_to_wishlist(
    db: Session,
    user_id: int,
    wishlist: WishlistCreate
):

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.product_id == wishlist.product_id
    ).first()

    if existing:

        return existing

    db_wishlist = Wishlist(
        user_id=user_id,
        product_id=wishlist.product_id
    )

    db.add(db_wishlist)

    db.commit()

    db.refresh(db_wishlist)

    return db_wishlist


def get_user_wishlist(
    db: Session,
    user_id: int
):

    return db.query(Wishlist).filter(
        Wishlist.user_id == user_id
    ).all()


def remove_from_wishlist(
    db: Session,
    wishlist_id: int,
    user_id: int
):

    wishlist = db.query(Wishlist).filter(
        Wishlist.id == wishlist_id,
        Wishlist.user_id == user_id
    ).first()

    if not wishlist:

        return None

    db.delete(wishlist)

    db.commit()

    return wishlist