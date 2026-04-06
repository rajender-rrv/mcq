from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Subject


class SubjectRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, subject_id: int) -> Optional[Subject]:
        result = await db.execute(select(Subject).where(Subject.id == subject_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_subjects(
        db: AsyncSession,
        *,
        class_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Subject]:
        q = select(Subject).where(Subject.is_deleted.is_(False))
        if class_id is not None:
            q = q.where(Subject.class_id == class_id)
        q = q.order_by(Subject.id).limit(limit).offset(offset)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(db: AsyncSession, subject: Subject) -> Subject:
        db.add(subject)
        await db.commit()
        await db.refresh(subject)
        return subject

