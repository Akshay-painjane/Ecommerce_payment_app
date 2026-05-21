from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from sqlalchemy.orm import Session

import cloudinary.uploader

from app.cloudinary_config import *

from app.database import get_db

from app.dependencies.role_checker import admin_required

from app.auth.oauth import get_current_user

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

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


# -----------------------------
# Create Product + Upload Image
# -----------------------------

@router.post(
    "/",
    response_model=ProductOut
)
def create_new_product(

    name: str = Form(...),

    description: str = Form(None),

    price: float = Form(...),

    stock: int = Form(...),

    category_id: int = Form(...),

    rating: float = Form(4.5),

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user = Depends(get_current_user),

    admin = Depends(admin_required)

):

    upload_result = cloudinary.uploader.upload(
        file.file
    )

    image_url = upload_result["secure_url"]

    product_data = ProductCreate(

        name=name,

        description=description,

        price=price,

        stock=stock,

        category_id=category_id,

        image_url=image_url,

        rating=rating
    )

    db_product = create_product(
        db,
        product_data
    )

    if not db_product:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return db_product


# -----------------------------
# Get All Products
# -----------------------------

@router.get(
    "/",
    response_model=list[ProductOut]
)
def get_products(
    db: Session = Depends(get_db)
):

    return get_all_products(db)


# -----------------------------
# Get Single Product
# -----------------------------

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


# -----------------------------
# Update Product
# -----------------------------

@router.put(
    "/{product_id}",
    response_model=ProductOut
)
def update_single_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    admin = Depends(admin_required)
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


# -----------------------------
# Delete Product
# -----------------------------

@router.delete(
    "/{product_id}"
)
def delete_single_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    admin = Depends(admin_required)
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