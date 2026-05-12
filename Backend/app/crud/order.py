from sqlalchemy.orm import Session

from app.models.order import Order

from app.models.order_item import OrderItem

from app.models.product import Product

from app.schemas.order import (
    SingleOrderCreate,
    BulkOrderCreate
)


# Single Product Order

def create_single_order(
    db: Session,
    user_id: int,
    order: SingleOrderCreate
):

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if not product:

        raise Exception("Product not found")

    if product.stock < order.quantity:

        raise Exception("Out of stock")

    total_price = (
        product.price * order.quantity
    )

    db_order = Order(
        user_id=user_id,
        total_price=total_price
    )

    db.add(db_order)

    db.commit()

    db.refresh(db_order)

    # Reduce stock

    product.stock -= order.quantity

    # Create order item

    order_item = OrderItem(
        order_id=db_order.id,
        product_id=product.id,
        quantity=order.quantity,
        price=product.price
    )

    db.add(order_item)

    db.commit()

    db.refresh(db_order)

    return db_order


# Bulk Product Order

def create_bulk_order(
    db: Session,
    user_id: int,
    order: BulkOrderCreate
):

    total_price = 0

    # Validate stock

    for item in order.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:

            raise Exception(
                "Product not found"
            )

        if product.stock < item.quantity:

            raise Exception(
                f"{product.name} out of stock"
            )

        total_price += (
            product.price * item.quantity
        )

    # Create order

    db_order = Order(
        user_id=user_id,
        total_price=total_price
    )

    db.add(db_order)

    db.commit()

    db.refresh(db_order)

    # Create order items

    for item in order.items:

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        # Reduce stock

        product.stock -= item.quantity

        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )

        db.add(order_item)

    db.commit()

    db.refresh(db_order)

    return db_order