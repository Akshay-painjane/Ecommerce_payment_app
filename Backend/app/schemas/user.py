from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):

    name: str

    email: EmailStr

    password: str

    phone: str | None = None

    profile_image: str | None = None


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class RefreshTokenRequest(BaseModel):

    refresh_token: str


# Update Profile Schema

class UserUpdate(BaseModel):

    name: str

    phone: str | None = None

    profile_image: str | None = None


class UserOut(BaseModel):

    id: int

    name: str

    email: EmailStr

    role: str

    phone: str | None = None

    profile_image: str | None = None

    class Config:
        from_attributes = True