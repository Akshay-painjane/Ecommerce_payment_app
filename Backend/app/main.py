from fastapi import FastAPI

app = FastAPI(title="Ecommerce Payment App")


@app.get("/")
def home():
    return {"message": "Ecommerce Payment App API is running"}
