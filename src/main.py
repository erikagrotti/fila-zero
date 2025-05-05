from fastapi import FastAPI
from src.api.routers import auth_router

app = FastAPI()

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
