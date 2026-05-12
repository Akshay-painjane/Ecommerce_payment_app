from sqlalchemy.orm import Session

from Backend.app.models.user import User

from Backend.app.schemas.user import UserCreate

from Backend.app.auth.hashing import hash_password


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
        password=hashed_password
    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user


def get_user_by_email(
    db: Session,
    email: str
):

    return db.query(User).filter(
        User.email == email
    ).first()