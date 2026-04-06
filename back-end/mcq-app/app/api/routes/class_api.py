# app/api/routes/class_api.py

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.models import User
from app.schemas.class_ import ClassCreate, ClassOut, ClassUpdate
from app.services.class_service import ClassService

router = APIRouter()


@router.post("/", status_code=201, response_model=ClassOut)
async def create_class(
    body: ClassCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await ClassService.create_class(db, body)


@router.get("/", response_model=List[ClassOut])
async def list_classes(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
    limit: int = Query(50, le=100),
    offset: int = 0,
):
    return await ClassService.list_classes(db, limit=limit, offset=offset)


@router.get("/{class_id}", response_model=ClassOut)
async def get_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await ClassService.get_class(db, class_id)


@router.put("/{class_id}", response_model=ClassOut)
async def update_class(
    class_id: int,
    body: ClassUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await ClassService.update_class(db, class_id, body)


@router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
):
    return await ClassService.delete_class(db, class_id, deleted_by_user_id=current.id)

