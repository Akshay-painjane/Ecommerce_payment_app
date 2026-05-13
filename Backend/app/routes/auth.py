from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.user import UserLogin

from app.crud.user import get_user_by_email

from app.auth.hashing import verify_password

from jose import JWTError, jwt

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
        "token_type": "bearer"
    }
@router.post("/refresh")
def refresh_access_token(
    refresh_token: str
):

    try:

        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

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