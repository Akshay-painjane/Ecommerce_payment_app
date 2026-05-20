from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

from app.database import get_db
from app.models.user import User

from app.auth.jwt import (
    create_access_token,
    create_refresh_token
)

config = Config(".env")

router = APIRouter(
    prefix="/auth/google",
    tags=["Google Auth"]
)

oauth = OAuth(config)

oauth.register(
    name="google",
    client_id=config("GOOGLE_CLIENT_ID"),
    client_secret=config("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)


@router.get("/login")
async def google_login(request: Request):

    redirect_uri = request.url_for("google_callback")

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    token = await oauth.google.authorize_access_token(request)

    user_info = token.get("userinfo")

    email = user_info.get("email")

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:

        user = User(
            name=user_info.get("name"),
            email=email,
            profile_image=user_info.get("picture"),
            role="user"
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(
        data={
            "sub": user.email
        }
    )

    refresh_token = create_refresh_token(
        data={
            "sub": user.email
        }
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "profile_image": user.profile_image
        }
    }