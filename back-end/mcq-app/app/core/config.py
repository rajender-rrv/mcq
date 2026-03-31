from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Note: for dedicated schema usage, set search_path via DATABASE_URL, e.g.
    # postgresql+asyncpg://.../mcq_db?options=-csearch_path%3Dmcq_default,public
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/mcq_db"

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