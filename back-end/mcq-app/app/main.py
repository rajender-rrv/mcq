# app/main.py

from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.api.router import api_router


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app = FastAPI(title="MCQ App",
    description="These are the APIs for the MCQ App.",
    version="1.0.0",
    swagger_ui_parameters={
        "operationsSorter": "method",
        "docExpansion": "none",
        "tryItOutEnabled": True,
    })

app.add_middleware(SecurityHeadersMiddleware)
app.include_router(api_router)