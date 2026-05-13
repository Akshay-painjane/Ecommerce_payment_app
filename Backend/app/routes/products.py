from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductOut
)

from app.crud.product import (
    create_product,
    get_all_products,
    get_product_by_id,
    update_product,
    delete_product
)

from app.auth.oauth import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post(
    "/",
    response_model=ProductOut
)
def create_new_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    db_product = create_product(db, product)

    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return db_product


@router.get(
    "/",
    response_model=list[ProductOut]
)
def get_products(
    db: Session = Depends(get_db)
):

    return get_all_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductOut
)
def get_single_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = get_product_by_id(
        db,
        product_id
    )

    if not product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.put(
    "/{product_id}",
    response_model=ProductOut
)
def update_single_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    updated_product = update_product(
        db,
        product_id,
        product
    )

    if not updated_product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return updated_product


@router.delete(
    "/{product_id}"
)
def delete_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    deleted_product = delete_product(
        db,
        product_id
    )

    if not deleted_product:

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "message": "Product deleted successfully"
    }