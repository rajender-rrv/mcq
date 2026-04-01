from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Note: with `postgresql+asyncpg`, don't use `?options=-csearch_path=...` in the URL.
    # asyncpg does not accept an `options=` kwarg, and SQLAlchemy will forward it.
    # Use `DB_SEARCH_PATH` instead (e.g. "mcq,public").
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mcq_db"
    DB_SEARCH_PATH: Optional[str] = None

    # Use a long random value in production (e.g. openssl rand -hex 32).
    SECRET_KEY: str = Field(
        default="dev-only-change-me-use-env-secret-key-32bytes-min!!",
        min_length=32,
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = ".env"


settings = Settings()