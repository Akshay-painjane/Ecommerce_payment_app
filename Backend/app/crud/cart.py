from sqlalchemy.orm import Session

from Backend.app.models.cart import Cart

from Backend.app.schemas.cart import CartCreate


def add_to_cart(
    db: Session,
    user_id: int,
    cart: CartCreate
):

    db_cart = Cart(
        user_id=user_id,
        product_id=cart.product_id,
        quantity=cart.quantity
    )

    db.add(db_cart)

    db.commit()

    db.refresh(db_cart)

    return db_cart

def bulk_add_to_cart(
    db: Session,
    user_id: int,
    items
):

    cart_items = []

    for item in items:

        db_cart = Cart(
            user_id=user_id,
            product_id=item.product_id,
            quantity=item.quantity
        )

        db.add(db_cart)

        cart_items.append(db_cart)

    db.commit()

    return cart_items

def get_user_cart(
    db: Session,
    user_id: int
):

    return db.query(Cart).filter(
        Cart.user_id == user_id
    ).all()