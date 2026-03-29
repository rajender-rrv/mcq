from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Question, QuestionOption
from app.repositories.question_repo import QuestionRepository
from app.schemas.question import QuestionCreate, QuestionOptionCreate, QuestionUpdate


def _exactly_one_correct(options: List[Any]) -> bool:
    return sum(1 for o in options if o.is_correct) == 1


class QuestionService:
    _PLACEHOLDER_USER_ID = 1

    @staticmethod
    async def create_question(db: AsyncSession, body: QuestionCreate) -> Dict[str, int]:
        if not _exactly_one_correct(body.options):
            raise HTTPException(status_code=400, detail="Exactly one correct option required")

        question = Question(
            question_text=body.question_text,
            explanation=body.explanation,
            class_id=body.class_id,
            subject_id=body.subject_id,
            category_id=body.category_id,
            created_by=QuestionService._PLACEHOLDER_USER_ID,
        )
        opts = [
            QuestionOption(option_text=o.option_text, is_correct=o.is_correct)
            for o in body.options
        ]
        created = await QuestionRepository.create(db, question, opts)
        return {"id": created.id}

    @staticmethod
    async def get_question(db: AsyncSession, question_id: int) -> Dict[str, Any]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")

        options = await QuestionRepository.list_options(db, q.id)
        return {
            "id": q.id,
            "question_text": q.question_text,
            "explanation": q.explanation,
            "class_id": q.class_id,
            "subject_id": q.subject_id,
            "category_id": q.category_id,
            "options": list(options),
        }

    @staticmethod
    async def list_questions(
        db: AsyncSession,
        *,
        subject_id: Optional[int] = None,
        category_id: Optional[int] = None,
        class_id: Optional[int] = None,
        limit: int = 10,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        rows = await QuestionRepository.list_questions(
            db,
            subject_id=subject_id,
            category_id=category_id,
            class_id=class_id,
            limit=limit,
            offset=offset,
        )
        result: List[Dict[str, Any]] = []
        for q in rows:
            options = await QuestionRepository.list_options(db, q.id)
            result.append(
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "options": [{"id": o.id, "text": o.option_text} for o in options],
                }
            )
        return result

    @staticmethod
    async def update_question(
        db: AsyncSession, question_id: int, body: QuestionUpdate
    ) -> Dict[str, str]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")

        data = body.model_dump(exclude_unset=True)
        opts_payload = data.pop("options", None)

        for field, value in data.items():
            setattr(q, field, value)

        if opts_payload is not None:
            opt_models = [QuestionOptionCreate(**o) for o in opts_payload]
            if not _exactly_one_correct(opt_models):
                raise HTTPException(status_code=400, detail="Exactly one correct option required")
            new_opts = [
                QuestionOption(option_text=o.option_text, is_correct=o.is_correct)
                for o in opt_models
            ]
            await QuestionRepository.replace_options(db, q.id, new_opts)

        await db.commit()
        await db.refresh(q)
        return {"message": "updated"}

    @staticmethod
    async def delete_question(db: AsyncSession, question_id: int) -> Dict[str, str]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")

        q.is_deleted = True
        await db.commit()
        return {"message": "deleted"}
