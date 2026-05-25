from sqlalchemy.orm import Session

from app.models.cart import Cart

from app.schemas.cart import CartCreate


# Add single product to cart

def add_to_cart(
    db: Session,
    user_id: int,
    cart: CartCreate
):

    db_cart = db.query(Cart).filter(

        Cart.user_id == user_id,

        Cart.product_id == cart.product_id

    ).first()

    # If product already exists in cart
    # increase quantity

    if db_cart:

        db_cart.quantity += cart.quantity

    else:

        db_cart = Cart(

            user_id=user_id,

            product_id=cart.product_id,

            quantity=cart.quantity
        )

        db.add(db_cart)

    db.commit()

    db.refresh(db_cart)

    return db_cart


# Add multiple products to cart

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


# Get user cart

def get_user_cart(
    db: Session,
    user_id: int
):

    return db.query(Cart).filter(

        Cart.user_id == user_id

    ).all()


# Remove cart item

def remove_from_cart(
    db: Session,
    user_id: int,
    cart_id: int
):

    db_cart = db.query(Cart).filter(

        Cart.id == cart_id,

        Cart.user_id == user_id

    ).first()

    if not db_cart:

        return None

    db.delete(db_cart)

    db.commit()

    return db_cart


# Update cart quantity

def update_cart_item(
    db: Session,
    user_id: int,
    cart_id: int,
    quantity: int
):

    db_cart = db.query(Cart).filter(

        Cart.id == cart_id,

        Cart.user_id == user_id

    ).first()

    if not db_cart:

        return None

    db_cart.quantity = quantity

    db.commit()

    db.refresh(db_cart)

    return db_cart