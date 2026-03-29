# app/main.py

from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="MCQ App")

app.include_router(api_router)