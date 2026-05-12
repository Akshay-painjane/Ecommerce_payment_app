from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from Backend.app.logs import logger

router = APIRouter(prefix="/auth", tags=["Auth"])

users = {}

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
def register_user(data: RegisterRequest):
    if data.email in users:
        logger.warning(f"Register failed: email already exists - {data.email}")
        raise HTTPException(status_code=400, detail="User already exists")

    users[data.email] = {
        "name": data.name,
        "email": data.email,
        "password": data.password
    }

    logger.info(f"User registered successfully: {data.email}")
    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(data: LoginRequest):
    user = users.get(data.email)

    if not user or user["password"] != data.password:
        logger.warning(f"Login failed for email: {data.email}")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    logger.info(f"User logged in successfully: {data.email}")
    return {"message": "Login successful", "user": user["name"]}