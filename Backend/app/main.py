from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#Models
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.cart import Cart
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
from app.models.wishlist import Wishlist
from app.models.return_request import ReturnRequest
#static
from fastapi.staticfiles import StaticFiles
#Routers
from app.routes.auth import router as auth_router
from app.routes.products import router as product_router
from app.routes.categories import router as category_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as order_router
from app.routes.payments import router as payment_router
from app.routes import google_auth
from app.routes.wishlist import router as wishlist_router
from app.routes import returns
from starlette.middleware.sessions import SessionMiddleware
app = FastAPI(
    title="Ecommerce Payment App",
    version="1.0.0",
    description="""
    Ecommerce Backend APIs
 
    Features:
    - Authentication
    - Products
    - Categories
    - Cart
    - Bulk Cart
    - Orders
    - Bulk Orders
    - Payments
    """
)
app.add_middleware(
    SessionMiddleware,
    secret_key="your_super_secret_key"
)
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)
 
#CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
#Include Routers
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(google_auth.router)
app.include_router(wishlist_router)
app.include_router(returns.router)
#Home Route
@app.get("/", tags=["Core"])
def home():
    return {
        "message": "Ecommerce Payment App API is running"
    }

