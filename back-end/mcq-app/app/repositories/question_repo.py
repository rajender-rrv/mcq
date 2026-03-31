from typing import List, Optional, Sequence

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Question, QuestionOption, QuestionTag, Tag
from app.repositories.tag_repo import slugify_label


class QuestionRepository:

    @staticmethod
    async def get_by_id(db: AsyncSession, question_id: int) -> Optional[Question]:
        result = await db.execute(select(Question).where(Question.id == question_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_active_by_question_hash(
        db: AsyncSession,
        question_hash: str,
        *,
        exclude_id: Optional[int] = None,
    ) -> Optional[Question]:
        q = select(Question).where(
            Question.is_deleted.is_(False),
            Question.question_hash == question_hash,
        )
        if exclude_id is not None:
            q = q.where(Question.id != exclude_id)
        result = await db.execute(q.limit(1))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_active_by_normalized_text(
        db: AsyncSession,
        normalized_question_text: str,
        *,
        exclude_id: Optional[int] = None,
    ) -> Optional[Question]:
        q = select(Question).where(
            Question.is_deleted.is_(False),
            Question.normalized_question_text == normalized_question_text,
        )
        if exclude_id is not None:
            q = q.where(Question.id != exclude_id)
        result = await db.execute(q.limit(1))
        return result.scalar_one_or_none()

    @staticmethod
    async def find_similar_active_questions(
        db: AsyncSession,
        normalized_question_text: str,
        *,
        threshold: float = 0.88,
        limit: int = 5,
        class_id: Optional[int] = None,
        subject_id: Optional[int] = None,
        category_id: Optional[int] = None,
        exclude_id: Optional[int] = None,
    ) -> List[dict]:
        """
        Uses PostgreSQL pg_trgm similarity() on normalized_question_text.
        Returns list of dicts: {id, question_text, score}.
        """
        where = [
            "is_deleted = false",
            "normalized_question_text IS NOT NULL",
            "similarity(normalized_question_text, :q) >= :threshold",
        ]
        params: dict = {
            "q": normalized_question_text,
            "threshold": threshold,
            "limit": limit,
        }
        if class_id is not None:
            where.append("class_id = :class_id")
            params["class_id"] = class_id
        if subject_id is not None:
            where.append("subject_id = :subject_id")
            params["subject_id"] = subject_id
        if category_id is not None:
            where.append("category_id = :category_id")
            params["category_id"] = category_id
        if exclude_id is not None:
            where.append("id <> :exclude_id")
            params["exclude_id"] = exclude_id

        sql = f"""
        SELECT id, question_text,
               similarity(normalized_question_text, :q) AS score
        FROM questions
        WHERE {' AND '.join(where)}
        ORDER BY score DESC
        LIMIT :limit
        """
        result = await db.execute(text(sql), params)
        return [dict(r) for r in result.mappings().all()]

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
        tag_slug: Optional[str] = None,
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
        if tag_slug is not None:
            slug = slugify_label(tag_slug)
            q = (
                q.join(QuestionTag, QuestionTag.question_id == Question.id)
                .join(Tag, Tag.id == QuestionTag.tag_id)
                .where(Tag.slug == slug)
                .distinct()
            )
        q = q.limit(limit).offset(offset)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create(
        db: AsyncSession,
        question: Question,
        options: List[QuestionOption],
        tag_ids: Optional[Sequence[int]] = None,
    ) -> Question:
        db.add(question)
        await db.flush()
        for opt in options:
            opt.question_id = question.id
            db.add(opt)
        if tag_ids:
            for tid in tag_ids:
                db.add(QuestionTag(question_id=question.id, tag_id=tid))
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
