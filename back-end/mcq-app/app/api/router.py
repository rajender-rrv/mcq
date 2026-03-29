# app/api/router.py

from fastapi import APIRouter
from app.api.routes import users, questions, templates, attempts

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(questions.router, prefix="/questions", tags=["Questions"])
api_router.include_router(templates.router, prefix="/templates", tags=["Templates"])
api_router.include_router(attempts.router, prefix="/attempts", tags=["Attempts"])