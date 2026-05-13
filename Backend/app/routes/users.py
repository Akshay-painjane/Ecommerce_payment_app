from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.user import UserCreate, UserOut

from app.crud.user import create_user
from app.auth.oauth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=UserOut)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    return create_user(db, user)

@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }