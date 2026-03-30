# app/api/routes/attempt_api.py

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.models import User
from app.schemas.attempt import (
    AttemptHistoryItem,
    AttemptQuestionItem,
    AttemptQuestionReviewItem,
    StartAttemptRequest,
    StartAttemptResponse,
    SubmitAttemptRequest,
    SubmitAttemptResponse,
)
from app.services.attempt_service import AttemptService

router = APIRouter()


@router.post("/start", status_code=201, response_model=StartAttemptResponse)
async def start_attempt(
    body: StartAttemptRequest,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await AttemptService.start_attempt(db, body, user_id=current.id)


@router.get("/me/history", response_model=List[AttemptHistoryItem])
async def list_my_attempt_history(
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    return await AttemptService.list_user_history(
        db,
        user_id=current.id,
        actor=current,
        limit=limit,
        offset=offset,
    )


@router.get("/users/{user_id}/history", response_model=List[AttemptHistoryItem])
async def list_user_attempt_history(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    return await AttemptService.list_user_history(
        db,
        user_id=user_id,
        actor=current,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{attempt_id}/questions/review",
    response_model=List[AttemptQuestionReviewItem],
)
async def get_attempt_questions_review(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await AttemptService.get_attempt_questions_review(
        db, attempt_id, actor=current
    )


@router.get("/{attempt_id}/questions", response_model=List[AttemptQuestionItem])
async def get_attempt_questions(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await AttemptService.get_attempt_questions(
        db, attempt_id, actor=current
    )


@router.post("/{attempt_id}/submit", response_model=SubmitAttemptResponse)
async def submit_attempt(
    attempt_id: int,
    body: SubmitAttemptRequest,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(get_current_active_user),
):
    return await AttemptService.submit_attempt(
        db, attempt_id, body, actor=current
    )
