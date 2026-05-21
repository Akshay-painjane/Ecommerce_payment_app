from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.user import RefreshTokenRequest, UserCreate, UserLogin, UserOut

from app.crud.user import create_user, get_user_by_email

from app.auth.hashing import verify_password
from app.auth.oauth import get_current_user

from jose import JWTError, jwt
from fastapi import BackgroundTasks
from app.utils.email_service import send_email
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM
)



router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def user_payload(db_user):
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "phone": db_user.phone,
        "profile_image": db_user.profile_image
    }

@router.post("/register", response_model=UserOut)
def register(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = create_user(db, user)

    # trigger background email event
    background_tasks.add_task(
        send_email,
        new_user.email,
        "Welcome to Style Store",
        f"""
        <h2>Hello {new_user.name}</h2>
        <p>Your account has been created successfully.</p>
        <p>Welcome to Style Store.</p>
        """
    )

    return new_user

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = get_user_by_email(
        db,
        user.email
    )

    if not db_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
            "sub": db_user.email
        }
    )
    refresh_token = create_refresh_token(
        data={
            "sub": db_user.email
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_payload(db_user)
    }


@router.get("/me")
def me(current_user = Depends(get_current_user)):
    return user_payload(current_user)


@router.post("/refresh")
def refresh_access_token(
    payload: RefreshTokenRequest
):

    try:

        decoded_payload = jwt.decode(
            payload.refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = decoded_payload.get("sub")
        token_type = decoded_payload.get("type")

        if token_type != "refresh":

            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        if email is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    new_access_token = create_access_token(
        data={
            "sub": email
        }
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }
