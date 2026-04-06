from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Class


class ClassRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, class_id: int) -> Optional[Class]:
        result = await db.execute(select(Class).where(Class.id == class_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_classes(
        db: AsyncSession, *, limit: int = 50, offset: int = 0
    ) -> List[Class]:
        q = (
            select(Class)
            .where(Class.is_deleted.is_(False))
            .order_by(Class.id)
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, clazz: Class) -> Class:
        db.add(clazz)
        await db.commit()
        await db.refresh(clazz)
        return clazz

