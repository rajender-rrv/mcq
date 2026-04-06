# app/api/routes/category_api.py

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, require_admin
from app.db.session import get_db
from app.models.models import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter()


@router.post("/", status_code=201, response_model=CategoryOut)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await CategoryService.create_category(db, body)


@router.get("/", response_model=List[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
    limit: int = Query(50, le=100),
    offset: int = 0,
):
    return await CategoryService.list_categories(db, limit=limit, offset=offset)


@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await CategoryService.get_category(db, category_id)


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category(
    category_id: int,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    return await CategoryService.update_category(db, category_id, body)


@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    current: User = Depends(require_admin),
):
    return await CategoryService.delete_category(
        db, category_id, deleted_by_user_id=current.id
    )

