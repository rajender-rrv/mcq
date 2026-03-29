import random
from typing import Dict, List

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    QuestionOption,
    TestAttempt,
    TestAttemptQuestion,
    TestTemplate,
    User,
    UserAnswer,
)
from app.repositories.attempt_repo import AttemptRepository
from app.schemas.attempt import (
    AttemptHistoryItem,
    AttemptQuestionItem,
    AttemptQuestionOptionOut,
    StartAttemptRequest,
    StartAttemptResponse,
    SubmitAttemptRequest,
    SubmitAttemptResponse,
)


def _options_with_labels(
    options: List[QuestionOption], *, seed: int
) -> List[AttemptQuestionOptionOut]:
    ordered = list(options)
    random.Random(seed).shuffle(ordered)
    out: List[AttemptQuestionOptionOut] = []
    for i, o in enumerate(ordered):
        label = chr(ord("A") + i) if i < 26 else str(i + 1)
        out.append(AttemptQuestionOptionOut(label=label, id=o.id, text=o.option_text))
    return out


class AttemptService:

    @staticmethod
    async def start_attempt(
        db: AsyncSession,
        body: StartAttemptRequest,
        *,
        user_id: int,
    ) -> StartAttemptResponse:
        template = await AttemptRepository.get_template(db, body.template_id)
        if template is None or template.is_deleted:
            raise HTTPException(status_code=404, detail="Template not found")
        if template.total_questions < 1:
            raise HTTPException(status_code=400, detail="Template must require at least one question")

        questions = await AttemptRepository.pick_random_questions(
            db,
            subject_id=template.subject_id,
            category_id=template.category_id,
            limit=template.total_questions,
        )
        if len(questions) < template.total_questions:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Not enough questions available for this template "
                    f"(need {template.total_questions}, found {len(questions)})"
                ),
            )

        attempt = TestAttempt(
            user_id=user_id,
            template_id=body.template_id,
        )
        attempt_questions = [
            TestAttemptQuestion(
                question_id=q.id,
                question_order=idx + 1,
            )
            for idx, q in enumerate(questions)
        ]
        created = await AttemptRepository.create_attempt(db, attempt, attempt_questions)
        return StartAttemptResponse(
            attempt_id=created.id,
            template_id=body.template_id,
            total_questions=len(questions),
        )

    @staticmethod
    async def get_attempt_questions(
        db: AsyncSession,
        attempt_id: int,
        *,
        actor: User,
    ) -> List[AttemptQuestionItem]:
        attempt = await AttemptRepository.get_attempt(db, attempt_id)
        if attempt is None:
            raise HTTPException(status_code=404, detail="Attempt not found")
        if attempt.user_id != actor.id:
            raise HTTPException(status_code=403, detail="Forbidden")

        rows = await AttemptRepository.list_attempt_questions_with_questions(db, attempt_id)
        if not rows:
            raise HTTPException(status_code=404, detail="Attempt not found or has no questions")

        question_ids = [q.id for _, q in rows]
        all_options = await AttemptRepository.list_options_for_questions(db, question_ids)
        by_qid: Dict[int, List[QuestionOption]] = {}
        for opt in all_options:
            by_qid.setdefault(opt.question_id, []).append(opt)

        items: List[AttemptQuestionItem] = []
        for taq, q in rows:
            opts = by_qid.get(q.id, [])
            items.append(
                AttemptQuestionItem(
                    attempt_question_id=taq.id,
                    question_order=taq.question_order,
                    question_id=q.id,
                    question_text=q.question_text,
                    options=_options_with_labels(opts, seed=taq.id),
                )
            )
        return items

    @staticmethod
    async def submit_attempt(
        db: AsyncSession,
        attempt_id: int,
        body: SubmitAttemptRequest,
        *,
        actor: User,
    ) -> SubmitAttemptResponse:
        attempt = await AttemptRepository.get_attempt(db, attempt_id)
        if attempt is None:
            raise HTTPException(status_code=404, detail="Attempt not found")
        if attempt.user_id != actor.id:
            raise HTTPException(status_code=403, detail="Not allowed to submit this attempt")
        if attempt.status != "IN_PROGRESS":
            raise HTTPException(status_code=400, detail="Attempt is not in progress")

        existing = await AttemptRepository.count_answers_for_attempt(db, attempt_id)
        if existing > 0:
            raise HTTPException(status_code=400, detail="Attempt already submitted")

        taqs = await AttemptRepository.list_attempt_question_rows(db, attempt_id)
        expected_ids = {taq.id for taq in taqs}
        by_id = {taq.id: taq for taq in taqs}

        if len(body.answers) != len(expected_ids):
            raise HTTPException(
                status_code=400,
                detail="You must submit an answer for every question in one request",
            )

        seen: set[int] = set()
        user_answers: List[UserAnswer] = []
        score = 0

        for ans in body.answers:
            if ans.attempt_question_id in seen:
                raise HTTPException(status_code=400, detail="Duplicate attempt_question_id")
            seen.add(ans.attempt_question_id)

            taq = by_id.get(ans.attempt_question_id)
            if taq is None:
                raise HTTPException(status_code=400, detail="Invalid attempt_question_id")

            opt = await AttemptRepository.get_option_by_id(db, ans.selected_option_id)
            if opt is None or opt.question_id != taq.question_id:
                raise HTTPException(
                    status_code=400,
                    detail="Selected option does not belong to this question",
                )

            if opt.is_correct:
                score += 1

            user_answers.append(
                UserAnswer(
                    attempt_question_id=taq.id,
                    selected_option_id=opt.id,
                    is_correct=opt.is_correct,
                )
            )

        if seen != expected_ids:
            raise HTTPException(
                status_code=400,
                detail="Answers must cover exactly the questions in this attempt",
            )

        await AttemptRepository.insert_user_answers(db, user_answers)
        await AttemptRepository.save_completed_attempt(db, attempt, score=score)

        return SubmitAttemptResponse(
            attempt_id=attempt.id,
            score=score,
            total_questions=len(taqs),
            status=attempt.status,
        )

    @staticmethod
    async def list_user_history(
        db: AsyncSession,
        *,
        user_id: int,
        actor: User,
        limit: int = 20,
        offset: int = 0,
    ) -> List[AttemptHistoryItem]:
        if actor.role != "admin" and actor.id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")
        attempts = await AttemptRepository.list_attempts_for_user(
            db, user_id=user_id, limit=limit, offset=offset
        )
        template_ids = {a.template_id for a in attempts if a.template_id}
        names: Dict[int, str] = {}
        if template_ids:
            result = await db.execute(
                select(TestTemplate).where(TestTemplate.id.in_(template_ids))
            )
            for t in result.scalars().all():
                names[t.id] = t.name

        return [
            AttemptHistoryItem(
                id=a.id,
                template_id=a.template_id,
                template_name=names.get(a.template_id) if a.template_id else None,
                status=a.status,
                started_at=a.started_at,
                completed_at=a.completed_at,
                score=a.score,
            )
            for a in attempts
        ]
