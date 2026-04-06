# app/api/routes/subject_api.py

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.models import User
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectUpdate
from app.services.subject_service import SubjectService

router = APIRouter()


@router.post("/", status_code=201, response_model=SubjectOut)
async def create_subject(
    body: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await SubjectService.create_subject(db, body)


@router.get("/", response_model=List[SubjectOut])
async def list_subjects(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
    class_id: Optional[int] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
):
    return await SubjectService.list_subjects(
        db, class_id=class_id, limit=limit, offset=offset
    )


@router.get("/{subject_id}", response_model=SubjectOut)
async def get_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await SubjectService.get_subject(db, subject_id)


@router.put("/{subject_id}", response_model=SubjectOut)
async def update_subject(
    subject_id: int,
    body: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await SubjectService.update_subject(db, subject_id, body)


@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
):
    return await SubjectService.delete_subject(
        db, subject_id, deleted_by_user_id=current.id
    )

