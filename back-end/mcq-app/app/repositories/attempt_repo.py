from datetime import datetime
from typing import List, Optional, Sequence, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    Question,
    QuestionOption,
    TestAttempt,
    TestAttemptQuestion,
    TestTemplate,
    UserAnswer,
)


class AttemptRepository:

    @staticmethod
    async def get_template(db: AsyncSession, template_id: int) -> Optional[TestTemplate]:
        result = await db.execute(select(TestTemplate).where(TestTemplate.id == template_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def pick_random_questions(
        db: AsyncSession,
        *,
        subject_id: Optional[int],
        category_id: Optional[int],
        limit: int,
    ) -> List[Question]:
        q = select(Question).where(
            Question.is_deleted.is_(False),
            Question.is_active.is_(True),
        )
        if subject_id is not None:
            q = q.where(Question.subject_id == subject_id)
        if category_id is not None:
            q = q.where(Question.category_id == category_id)
        q = q.order_by(func.random()).limit(limit)
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def create_attempt(
        db: AsyncSession,
        attempt: TestAttempt,
        attempt_questions: List[TestAttemptQuestion],
    ) -> TestAttempt:
        db.add(attempt)
        await db.flush()
        for taq in attempt_questions:
            taq.attempt_id = attempt.id
            db.add(taq)
        await db.commit()
        await db.refresh(attempt)
        return attempt

    @staticmethod
    async def get_attempt(db: AsyncSession, attempt_id: int) -> Optional[TestAttempt]:
        result = await db.execute(select(TestAttempt).where(TestAttempt.id == attempt_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_attempts_for_user(
        db: AsyncSession,
        *,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> List[TestAttempt]:
        q = (
            select(TestAttempt)
            .where(TestAttempt.user_id == user_id)
            .order_by(TestAttempt.started_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(q)
        return list(result.scalars().all())

    @staticmethod
    async def list_attempt_questions_with_questions(
        db: AsyncSession, attempt_id: int
    ) -> List[Tuple[TestAttemptQuestion, Question]]:
        stmt = (
            select(TestAttemptQuestion, Question)
            .join(Question, TestAttemptQuestion.question_id == Question.id)
            .where(TestAttemptQuestion.attempt_id == attempt_id)
            .order_by(TestAttemptQuestion.question_order)
        )
        result = await db.execute(stmt)
        return list(result.all())

    @staticmethod
    async def list_attempt_questions_with_questions_and_answers(
        db: AsyncSession, attempt_id: int
    ) -> List[Tuple[TestAttemptQuestion, Question, UserAnswer]]:
        stmt = (
            select(TestAttemptQuestion, Question, UserAnswer)
            .join(Question, TestAttemptQuestion.question_id == Question.id)
            .join(
                UserAnswer,
                UserAnswer.attempt_question_id == TestAttemptQuestion.id,
            )
            .where(TestAttemptQuestion.attempt_id == attempt_id)
            .order_by(TestAttemptQuestion.question_order)
        )
        result = await db.execute(stmt)
        return list(result.all())

    @staticmethod
    async def list_options_for_questions(
        db: AsyncSession, question_ids: Sequence[int]
    ) -> List[QuestionOption]:
        if not question_ids:
            return []
        result = await db.execute(
            select(QuestionOption).where(QuestionOption.question_id.in_(question_ids))
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_attempt_question_rows(
        db: AsyncSession, attempt_id: int
    ) -> List[TestAttemptQuestion]:
        result = await db.execute(
            select(TestAttemptQuestion).where(TestAttemptQuestion.attempt_id == attempt_id)
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_option_by_id(
        db: AsyncSession, option_id: int
    ) -> Optional[QuestionOption]:
        result = await db.execute(select(QuestionOption).where(QuestionOption.id == option_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def insert_user_answers(
        db: AsyncSession, answers: List[UserAnswer]
    ) -> None:
        for row in answers:
            db.add(row)

    @staticmethod
    async def save_completed_attempt(
        db: AsyncSession,
        attempt: TestAttempt,
        *,
        score: int,
    ) -> None:
        attempt.status = "COMPLETED"
        attempt.score = score
        attempt.completed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(attempt)

    @staticmethod
    async def count_answers_for_attempt(db: AsyncSession, attempt_id: int) -> int:
        stmt = (
            select(func.count())
            .select_from(UserAnswer)
            .join(
                TestAttemptQuestion,
                UserAnswer.attempt_question_id == TestAttemptQuestion.id,
            )
            .where(TestAttemptQuestion.attempt_id == attempt_id)
        )
        result = await db.execute(stmt)
        return int(result.scalar_one() or 0)
