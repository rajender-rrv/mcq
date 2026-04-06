from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Category


class CategoryRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, category_id: int) -> Optional[Category]:
        result = await db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_categories(
        db: AsyncSession, *, limit: int = 50, offset: int = 0
    ) -> List[Category]:
        q = (
            select(Category)
            .where(Category.is_deleted.is_(False))
            .order_by(Category.id)
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, category: Category) -> Category:
        db.add(category)
        await db.commit()
        await db.refresh(category)
        return category

