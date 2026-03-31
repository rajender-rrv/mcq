from typing import Any, Dict, List, Optional

import hashlib
import re
import unicodedata

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Question, QuestionOption, User
from app.repositories.question_repo import QuestionRepository
from app.repositories.tag_repo import TagRepository
from app.schemas.question import (
    QuestionCreate,
    QuestionDuplicateCheckRequest,
    QuestionDuplicateCheckResponse,
    QuestionOptionCreate,
    QuestionUpdate,
)


def _exactly_one_correct(options: List[Any]) -> bool:
    return sum(1 for o in options if o.is_correct) == 1


_WS_RE = re.compile(r"\s+", flags=re.UNICODE)
_PUNCT_RE = re.compile(r"[^\w\s]", flags=re.UNICODE)


def _canonical_question_text(text: str) -> str:
    """
    Canonical form used for hashing. Keeps punctuation but normalizes unicode and whitespace.
    """
    s = unicodedata.normalize("NFKC", text or "")
    s = s.strip().lower()
    s = _WS_RE.sub(" ", s)
    return s


def _normalized_question_text(text: str) -> str:
    """
    Normalized form used for dedup matching. More aggressive: removes punctuation.
    """
    s = unicodedata.normalize("NFKC", text or "")
    s = s.strip().lower()
    s = _PUNCT_RE.sub(" ", s)
    s = _WS_RE.sub(" ", s)
    return s


def _question_hash_from_canonical(canonical_text: str) -> str:
    return hashlib.sha256(canonical_text.encode("utf-8")).hexdigest()


class QuestionService:

    @staticmethod
    async def suggest_duplicates(
        db: AsyncSession,
        body: QuestionDuplicateCheckRequest,
        *,
        scope: str = "global",
        exclude_id: Optional[int] = None,
    ) -> QuestionDuplicateCheckResponse:
        normalized = _normalized_question_text(body.question_text)

        scope = (scope or "global").strip().lower()
        allowed = {"global", "class", "subject", "category"}
        if scope not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid scope. Must be one of: {', '.join(sorted(allowed))}",
            )

        class_id = body.class_id
        subject_id = body.subject_id
        category_id = body.category_id

        if scope == "class":
            if class_id is None:
                raise HTTPException(status_code=400, detail="class_id is required for scope=class")
            subject_id = None
            category_id = None
        elif scope == "subject":
            if subject_id is None:
                raise HTTPException(
                    status_code=400, detail="subject_id is required for scope=subject"
                )
            class_id = None
            category_id = None
        elif scope == "category":
            if category_id is None:
                raise HTTPException(
                    status_code=400, detail="category_id is required for scope=category"
                )
            class_id = None
            subject_id = None
        else:
            # global: ignore all scope filters
            class_id = None
            subject_id = None
            category_id = None

        rows = await QuestionRepository.find_similar_active_questions(
            db,
            normalized,
            threshold=body.threshold,
            limit=body.limit,
            class_id=class_id,
            subject_id=subject_id,
            category_id=category_id,
            exclude_id=exclude_id,
        )
        return {
            "normalized_question_text": normalized,
            "candidates": rows,
        }

    @staticmethod
    async def create_question(
        db: AsyncSession, body: QuestionCreate, *, created_by: int
    ) -> Dict[str, int]:
        if not _exactly_one_correct(body.options):
            raise HTTPException(status_code=400, detail="Exactly one correct option required")

        canonical = _canonical_question_text(body.question_text)
        normalized = _normalized_question_text(body.question_text)
        qhash = _question_hash_from_canonical(canonical)

        dup = await QuestionRepository.get_active_by_question_hash(db, qhash)
        if dup is None:
            dup = await QuestionRepository.get_active_by_normalized_text(db, normalized)
        if dup is not None:
            raise HTTPException(
                status_code=409,
                detail={
                    "message": "Duplicate question detected",
                    "duplicate_question_id": dup.id,
                },
            )

        question = Question(
            question_text=body.question_text,
            explanation=body.explanation,
            class_id=body.class_id,
            subject_id=body.subject_id,
            category_id=body.category_id,
            created_by=created_by,
            normalized_question_text=normalized,
            question_hash=qhash,
        )
        opts = [
            QuestionOption(option_text=o.option_text, is_correct=o.is_correct)
            for o in body.options
        ]
        tag_ids = None
        if body.tags:
            tags = await TagRepository.get_or_create_for_labels(db, body.tags)
            tag_ids = [t.id for t in tags]
        created = await QuestionRepository.create(db, question, opts, tag_ids=tag_ids)
        return {"id": created.id}

    @staticmethod
    async def get_question(db: AsyncSession, question_id: int) -> Dict[str, Any]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")

        options = await QuestionRepository.list_options(db, q.id)
        tags_map = await TagRepository.tags_by_question_ids(db, [q.id])
        tags = tags_map.get(q.id, [])
        return {
            "id": q.id,
            "question_text": q.question_text,
            "explanation": q.explanation,
            "class_id": q.class_id,
            "subject_id": q.subject_id,
            "category_id": q.category_id,
            "options": list(options),
            "tags": tags,
        }

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
    ) -> List[Dict[str, Any]]:
        rows = await QuestionRepository.list_questions(
            db,
            subject_id=subject_id,
            category_id=category_id,
            class_id=class_id,
            tag_slug=tag_slug,
            limit=limit,
            offset=offset,
        )
        qids = [q.id for q in rows]
        tags_map = await TagRepository.tags_by_question_ids(db, qids)
        result: List[Dict[str, Any]] = []
        for q in rows:
            options = await QuestionRepository.list_options(db, q.id)
            result.append(
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "options": [{"id": o.id, "text": o.option_text} for o in options],
                    "tags": tags_map.get(q.id, []),
                }
            )
        return result

    @staticmethod
    async def update_question(
        db: AsyncSession,
        question_id: int,
        body: QuestionUpdate,
        *,
        actor: User,
    ) -> Dict[str, str]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")
        if actor.role != "admin" and q.created_by != actor.id:
            raise HTTPException(status_code=403, detail="Forbidden")

        data = body.model_dump(exclude_unset=True)
        opts_payload = data.pop("options", None)
        tags_payload = data.pop("tags", None)

        if "question_text" in data and data["question_text"] is not None:
            canonical = _canonical_question_text(data["question_text"])
            normalized = _normalized_question_text(data["question_text"])
            qhash = _question_hash_from_canonical(canonical)

            dup = await QuestionRepository.get_active_by_question_hash(
                db, qhash, exclude_id=q.id
            )
            if dup is None:
                dup = await QuestionRepository.get_active_by_normalized_text(
                    db, normalized, exclude_id=q.id
                )
            if dup is not None:
                raise HTTPException(
                    status_code=409,
                    detail={
                        "message": "Duplicate question detected",
                        "duplicate_question_id": dup.id,
                    },
                )
            data["normalized_question_text"] = normalized
            data["question_hash"] = qhash

        for field, value in data.items():
            setattr(q, field, value)

        if tags_payload is not None:
            tags = await TagRepository.get_or_create_for_labels(db, tags_payload)
            await TagRepository.replace_question_tags(db, q.id, [t.id for t in tags])

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
    async def delete_question(
        db: AsyncSession,
        question_id: int,
        *,
        actor: User,
    ) -> Dict[str, str]:
        q = await QuestionRepository.get_by_id(db, question_id)
        if q is None or q.is_deleted:
            raise HTTPException(status_code=404, detail="Question not found")
        if actor.role != "admin" and q.created_by != actor.id:
            raise HTTPException(status_code=403, detail="Forbidden")

        q.is_deleted = True
        q.deleted_by = actor.id
        await db.commit()
        return {"message": "deleted"}
