from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import TestTemplate


class TemplateRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, template_id: int) -> Optional[TestTemplate]:
        result = await db.execute(select(TestTemplate).where(TestTemplate.id == template_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_templates(
        db: AsyncSession,
        *,
        subject_id: Optional[int] = None,
        category_id: Optional[int] = None,
        limit: int = 10,
        offset: int = 0,
    ) -> List[TestTemplate]:
        q = select(TestTemplate).where(TestTemplate.is_deleted.is_(False))
        if subject_id is not None:
            q = q.where(TestTemplate.subject_id == subject_id)
        if category_id is not None:
            q = q.where(TestTemplate.category_id == category_id)
        q = q.limit(limit).offset(offset)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, template: TestTemplate) -> TestTemplate:
        db.add(template)
        await db.commit()
        await db.refresh(template)
        return template
