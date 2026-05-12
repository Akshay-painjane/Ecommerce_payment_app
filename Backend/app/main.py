from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.logs import logger
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.products import router as products_router
from app.routes.categories import router as categories_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as orders_router
from app.routes.payments import router as payments_router

app = FastAPI(title="Ecommerce Payment App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(categories_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(payments_router)

@app.get("/")
def home():
    logger.info("Home API called")
    return {"message": "Ecommerce Payment App API is running"}
