from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.attempt import (
    AttemptHistoryItem,
    AttemptQuestionItem,
    StartAttemptRequest,
    StartAttemptResponse,
    SubmitAttemptRequest,
    SubmitAttemptResponse,
)
from app.services.attempt_service import AttemptService

router = APIRouter()


@router.post("/start", status_code=201, response_model=StartAttemptResponse)
async def start_attempt(body: StartAttemptRequest, db: AsyncSession = Depends(get_db)):
    return await AttemptService.start_attempt(db, body)


@router.get("/users/{user_id}", response_model=List[AttemptHistoryItem])
async def list_attempt_history(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    return await AttemptService.list_user_history(
        db, user_id=user_id, limit=limit, offset=offset
    )


@router.get("/{attempt_id}/questions", response_model=List[AttemptQuestionItem])
async def get_attempt_questions(attempt_id: int, db: AsyncSession = Depends(get_db)):
    return await AttemptService.get_attempt_questions(db, attempt_id)


@router.post("/{attempt_id}/submit", response_model=SubmitAttemptResponse)
async def submit_attempt(
    attempt_id: int,
    body: SubmitAttemptRequest,
    db: AsyncSession = Depends(get_db),
):
    return await AttemptService.submit_attempt(db, attempt_id, body)
