# app/api/router.py

from fastapi import APIRouter

from app.api.routes import (
    attempt_api,
    auth_api,
    category_api,
    class_api,
    health_api,
    question_api,
    subject_api,
    template_api,
    user_api,
)

api_router = APIRouter()

api_router.include_router(health_api.router, prefix="/health", tags=["Health"])
api_router.include_router(auth_api.router, prefix="/auth", tags=["Auth"])
api_router.include_router(user_api.router, prefix="/users", tags=["Users"])
api_router.include_router(question_api.router, prefix="/questions", tags=["Questions"])
api_router.include_router(class_api.router, prefix="/classes", tags=["Classes"])
api_router.include_router(subject_api.router, prefix="/subjects", tags=["Subjects"])
api_router.include_router(category_api.router, prefix="/categories", tags=["Categories"])
api_router.include_router(template_api.router, prefix="/templates", tags=["Templates"])
api_router.include_router(attempt_api.router, prefix="/attempts", tags=["Attempts"])