# app/repositories/user_repo.py

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import User

class UserRepository:

    @staticmethod
    async def list_all(db: AsyncSession):
        result = await db.execute(select(User).order_by(User.created_at))
        return list(result.scalars().all())

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: int):
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str):
        normalized = email.lower().strip()
        result = await db.execute(
            select(User).where(func.lower(User.email) == normalized)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, user: User):
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User, data: dict):
        for key, value in data.items():
            setattr(user, key, value)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete(db: AsyncSession, user: User):
        await db.delete(user)
        await db.commit()