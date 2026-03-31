# app/api/routes/question_api.py
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.question import (
    QuestionCreate,
    QuestionDuplicateCheckRequest,
    QuestionDuplicateCheckResponse,
    QuestionListItem,
    QuestionResponse,
    QuestionUpdate,
    TagOut,
)
from app.repositories.tag_repo import TagRepository
from app.services.question_service import QuestionService

router = APIRouter()


@router.get("/tags", response_model=List[TagOut])
async def list_question_tags_vocabulary(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    rows = await TagRepository.list_all(db)
    return list(rows)


@router.post("/", status_code=201)
async def create_question(
    body: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await QuestionService.create_question(db, body, created_by=current.id)


@router.post("/duplicates/check", response_model=QuestionDuplicateCheckResponse)
async def suggest_duplicate_questions(
    body: QuestionDuplicateCheckRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
    scope: str = Query(default="global", pattern="^(global|class|subject|category)$"),
):
    return await QuestionService.suggest_duplicates(db, body, scope=scope)


@router.get("/", response_model=List[QuestionListItem])
async def list_questions(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
    subject_id: Optional[int] = None,
    category_id: Optional[int] = None,
    class_id: Optional[int] = None,
    tag_slug: Optional[str] = None,
    limit: int = Query(10, le=100),
    offset: int = 0,
):
    return await QuestionService.list_questions(
        db,
        subject_id=subject_id,
        category_id=category_id,
        class_id=class_id,
        tag_slug=tag_slug,
        limit=limit,
        offset=offset,
    )


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await QuestionService.get_question(db, question_id)


@router.put("/{question_id}")
async def update_question(
    question_id: int,
    body: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await QuestionService.update_question(db, question_id, body, actor=current)


@router.delete("/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await QuestionService.delete_question(db, question_id, actor=current)
