# app/api/routes/questions_api.py

from typing import List, Optional


from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.question import QuestionCreate, QuestionListItem, QuestionResponse, QuestionUpdate
from app.services.question_service import QuestionService

router = APIRouter()


@router.post("/", status_code=201)
async def create_question(
    body: QuestionCreate,
    db: AsyncSession = Depends(get_db),
):
    return await QuestionService.create_question(db, body)


@router.get("/", response_model=List[QuestionListItem])
async def list_questions(
    db: AsyncSession = Depends(get_db),
    subject_id: Optional[int] = None,
    category_id: Optional[int] = None,
    class_id: Optional[int] = None,
    limit: int = Query(10, le=100),
    offset: int = 0,
):
    return await QuestionService.list_questions(
        db,
        subject_id=subject_id,
        category_id=category_id,
        class_id=class_id,
        limit=limit,
        offset=offset,
    )


@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(question_id: int, db: AsyncSession = Depends(get_db)):
    return await QuestionService.get_question(db, question_id)


@router.put("/{question_id}")
async def update_question(
    question_id: int,
    body: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await QuestionService.update_question(db, question_id, body)


@router.delete("/{question_id}")
async def delete_question(question_id: int, db: AsyncSession = Depends(get_db)):
    return await QuestionService.delete_question(db, question_id)
