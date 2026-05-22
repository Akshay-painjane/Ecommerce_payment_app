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

from app.schemas.category import (
    CategoryCreate,
    CategoryOut
)

from app.crud.category import (
    create_category,
    get_categories,
    get_category_by_id,
    update_category,
    delete_category
)

from app.dependencies.role_checker import admin_required


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


# Create category

@router.post(
    "/",
    response_model=CategoryOut
)
def create_new_category(

    name: str = Form(...),

    description: str = Form(None),

    file: UploadFile = File(...),

    db: Session = Depends(get_db),

    current_user = Depends(admin_required)
):

    upload_result = cloudinary.uploader.upload(
        file.file
    )

    image_url = upload_result["secure_url"]

    category_data = CategoryCreate(

        name=name,

        description=description,

        image_url=image_url
    )

    return create_category(
        db,
        category_data
    )


# Get all categories

@router.get(
    "/",
    response_model=list[CategoryOut]
)
def get_all_categories(
    db: Session = Depends(get_db)
):

    return get_categories(db)


# Get single category

@router.get(
    "/{category_id}",
    response_model=CategoryOut
)
def get_single_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = get_category_by_id(
        db,
        category_id
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# Update category

@router.put(
    "/{category_id}",
    response_model=CategoryOut
)
def update_single_category(

    category_id: int,

    name: str = Form(...),

    description: str = Form(None),

    file: UploadFile = File(None),

    db: Session = Depends(get_db),

    current_user = Depends(admin_required)
):

    category = get_category_by_id(
        db,
        category_id
    )

    if not category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    image_url = category.image_url

    # Upload new image if provided

    if file:

        upload_result = cloudinary.uploader.upload(
            file.file
        )

        image_url = upload_result["secure_url"]

    category_data = CategoryCreate(

        name=name,

        description=description,

        image_url=image_url
    )

    updated_category = update_category(
        db,
        category_id,
        category_data
    )

    return updated_category


# Delete category

@router.delete("/{category_id}")
def delete_single_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(admin_required)
):

    deleted_category = delete_category(
        db,
        category_id
    )

    if not deleted_category:

        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return {
        "message": "Category deleted successfully"
    }