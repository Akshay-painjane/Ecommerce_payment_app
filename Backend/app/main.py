import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import Base, SessionLocal, engine
#Models
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.cart import Cart
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.payment import Payment
#static
from fastapi.staticfiles import StaticFiles
#Routers
from app.routes.users import router as user_router
from app.routes.auth import router as auth_router
from app.routes.products import router as product_router
from app.routes.categories import router as category_router
from app.routes.cart import router as cart_router
from app.routes.orders import router as order_router
from app.routes.payments import router as payment_router
 
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


def ensure_schema_columns():
    if engine.dialect.name != "postgresql":
        return

    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR",
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 4.5",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS method VARCHAR DEFAULT 'Cash on Delivery'",
        "ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_id VARCHAR",
    ]

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def seed_database():
    db = SessionLocal()
    try:
        category_names = ["Mobiles", "Electronics", "Fashion", "Home", "Beauty", "Grocery"]
        categories = {}

        for name in category_names:
            category = db.query(Category).filter(Category.name == name).first()
            if not category:
                category = Category(name=name)
                db.add(category)
                db.commit()
                db.refresh(category)
            categories[name] = category

        if db.query(Product).count() == 0:
            db.add_all([
                Product(name="StylePhone Pro 5G", description="AMOLED 5G smartphone with all-day battery and crisp cameras.", price=49999, stock=24, rating=4.7, category_id=categories["Mobiles"].id, image_url="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"),
                Product(name="Wireless Noise-Cancel Headphones", description="Bluetooth headphones with premium sound and 40-hour playback.", price=8999, stock=45, rating=4.5, category_id=categories["Electronics"].id, image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"),
                Product(name="Classic Denim Jacket", description="Regular-fit denim jacket with durable stitching and everyday style.", price=2499, stock=60, rating=4.4, category_id=categories["Fashion"].id, image_url="https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80"),
                Product(name="Modern Ceramic Table Lamp", description="Warm bedside lamp with ceramic base and soft fabric shade.", price=1799, stock=32, rating=4.6, category_id=categories["Home"].id, image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"),
                Product(name="Hydrating Skin Care Kit", description="Daily cleanser, serum, and moisturizer set for a fresh routine.", price=1299, stock=38, rating=4.3, category_id=categories["Beauty"].id, image_url="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=80"),
                Product(name="Organic Grocery Essentials Pack", description="Weekly pantry bundle with grains, pulses, oil, and breakfast staples.", price=999, stock=100, rating=4.2, category_id=categories["Grocery"].id, image_url="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"),
            ])
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    os.makedirs("static/products", exist_ok=True)
    Base.metadata.create_all(bind=engine)
    ensure_schema_columns()
    seed_database()

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
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(category_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(payment_router)
 
#Home Route
@app.get("/", tags=["Core"])
def home():
    return {
        "message": "Ecommerce Payment App API is running"
    }

