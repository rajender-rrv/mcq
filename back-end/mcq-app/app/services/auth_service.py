from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_refresh_token,
    new_refresh_token_value,
    verify_password,
)
from app.repositories.refresh_token_repo import RefreshTokenRepository
from app.repositories.user_repo import UserRepository


def _login_failed() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _refresh_failed() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
    )


class AuthService:

    @staticmethod
    async def login(db: AsyncSession, *, email: str, password: str) -> dict:
        user = await UserRepository.get_by_email(db, email)
        if user is None or not user.is_active:
            raise _login_failed()
        if not verify_password(password, user.password_hash):
            raise _login_failed()

        raw_refresh = new_refresh_token_value()
        token_hash = hash_refresh_token(raw_refresh)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await RefreshTokenRepository.create(
            db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        access = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role},
        )
        return {
            "access_token": access,
            "refresh_token": raw_refresh,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    async def refresh(db: AsyncSession, *, refresh_token: str) -> dict:
        token_hash = hash_refresh_token(refresh_token)
        row = await RefreshTokenRepository.get_active_by_hash(db, token_hash)
        if row is None:
            raise _refresh_failed()

        user = await UserRepository.get_by_id(db, row.user_id)
        if user is None or not user.is_active:
            raise _refresh_failed()

        await RefreshTokenRepository.revoke(db, row)

        raw_refresh = new_refresh_token_value()
        new_hash = hash_refresh_token(raw_refresh)
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await RefreshTokenRepository.create(
            db,
            user_id=user.id,
            token_hash=new_hash,
            expires_at=expires_at,
        )

        access = create_access_token(
            subject=str(user.id),
            extra_claims={"role": user.role},
        )
        return {
            "access_token": access,
            "refresh_token": raw_refresh,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    @staticmethod
    async def logout(db: AsyncSession, *, refresh_token: str) -> None:
        token_hash = hash_refresh_token(refresh_token)
        row = await RefreshTokenRepository.get_active_by_hash(db, token_hash)
        if row is not None:
            await RefreshTokenRepository.revoke(db, row)
