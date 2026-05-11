from fastapi import FastAPI
from app.auth import router as auth_router
from app.logs import logger

app = FastAPI(title="Ecommerce Payment App")

app.include_router(auth_router)

@app.get("/")
def home():
    logger.info("Home API called")
    return {"message": "Ecommerce Payment App API is running"}