from typing import List, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Question, QuestionOption


class QuestionRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, question_id: int) -> Optional[Question]:
        result = await db.execute(select(Question).where(Question.id == question_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_options(db: AsyncSession, question_id: int) -> Sequence[QuestionOption]:
        result = await db.execute(
            select(QuestionOption).where(QuestionOption.question_id == question_id)
        )
        return result.scalars().all()

    @staticmethod
    async def list_questions(
        db: AsyncSession,
        *,
        subject_id: Optional[int] = None,
        category_id: Optional[int] = None,
        class_id: Optional[int] = None,
        limit: int = 10,
        offset: int = 0,
    ) -> List[Question]:
        q = select(Question).where(Question.is_deleted.is_(False))
        if subject_id is not None:
            q = q.where(Question.subject_id == subject_id)
        if category_id is not None:
            q = q.where(Question.category_id == category_id)
        if class_id is not None:
            q = q.where(Question.class_id == class_id)
        q = q.limit(limit).offset(offset)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession,
        question: Question,
        options: List[QuestionOption],
    ) -> Question:
        db.add(question)
        await db.flush()
        for opt in options:
            opt.question_id = question.id
            db.add(opt)
        await db.commit()
        await db.refresh(question)
        return question

    @staticmethod
    async def replace_options(
        db: AsyncSession,
        question_id: int,
        options: List[QuestionOption],
    ) -> None:
        existing = await db.execute(
            select(QuestionOption).where(QuestionOption.question_id == question_id)
        )
        for row in existing.scalars().all():
            await db.delete(row)
        await db.flush()
        for opt in options:
            opt.question_id = question_id
            db.add(opt)
