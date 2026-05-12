from fastapi import Depends, HTTPException

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import JWTError, jwt

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User

from app.auth.jwt import (
    SECRET_KEY,
    ALGORITHM
)


security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid token"
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:

        raise credentials_exception

    return user