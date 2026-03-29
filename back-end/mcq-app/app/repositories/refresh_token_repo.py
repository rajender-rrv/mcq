from datetime import datetime
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import RefreshToken


class RefreshTokenRepository:

    @staticmethod
    async def create(
        db: AsyncSession,
        *,
        user_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        row = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row

    @staticmethod
    async def get_active_by_hash(
        db: AsyncSession, token_hash: str
    ) -> Optional[RefreshToken]:
        now = datetime.utcnow()
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke(db: AsyncSession, row: RefreshToken) -> None:
        row.revoked_at = datetime.utcnow()
        await db.commit()

    @staticmethod
    async def revoke_all_for_user(db: AsyncSession, user_id: int) -> None:
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
            )
        )
        now = datetime.utcnow()
        for r in result.scalars().all():
            r.revoked_at = now
        await db.commit()
