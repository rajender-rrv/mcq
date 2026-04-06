from datetime import datetime
from typing import Dict, List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Category
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:

    @staticmethod
    async def create_category(db: AsyncSession, body: CategoryCreate) -> Category:
        row = Category(name=body.name)
        return await CategoryRepository.create(db, row)

    @staticmethod
    async def get_category(db: AsyncSession, category_id: int) -> Category:
        row = await CategoryRepository.get_by_id(db, category_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Category not found")
        return row

    @staticmethod
    async def list_categories(
        db: AsyncSession, *, limit: int = 50, offset: int = 0
    ) -> List[Category]:
        return await CategoryRepository.list_categories(db, limit=limit, offset=offset)

    @staticmethod
    async def update_category(
        db: AsyncSession, category_id: int, body: CategoryUpdate
    ) -> Category:
        row = await CategoryRepository.get_by_id(db, category_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Category not found")

        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(row, field, value)

        await db.commit()
        await db.refresh(row)
        return row

    @staticmethod
    async def delete_category(
        db: AsyncSession,
        category_id: int,
        *,
        deleted_by_user_id: int,
    ) -> Dict[str, str]:
        row = await CategoryRepository.get_by_id(db, category_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Category not found")

        row.is_deleted = True
        row.deleted_at = datetime.utcnow()
        row.deleted_by = deleted_by_user_id
        row.deleted_reason = "Deleted via API"

        await db.commit()
        return {"message": "deleted"}

