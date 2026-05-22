from sqlalchemy.orm import Session

from app.models.user import User

from app.schemas.user import (
    UserCreate,
    UserUpdate
)

from app.auth.hashing import hash_password


# Create User

def create_user(
    db: Session,
    user: UserCreate
):

    hashed_password = hash_password(
        user.password
    )

    db_user = User(

        name=user.name,

        email=user.email,

        password=hashed_password,

        role="user",

        phone=user.phone,

        profile_image=user.profile_image
    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user


# Get User By Email

def get_user_by_email(
    db: Session,
    email: str
):

    return db.query(User).filter(
        User.email == email
    ).first()


# Update User Profile

def update_user_profile(
    db: Session,
    user_id: int,
    user_data: UserUpdate
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        return None

    user.name = user_data.name

    user.phone = user_data.phone

    user.profile_image = user_data.profile_image

    db.commit()

    db.refresh(user)

    return user