from datetime import datetime
from typing import Dict, List

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Class
from app.repositories.class_repo import ClassRepository
from app.schemas.class_ import ClassCreate, ClassUpdate


class ClassService:

    @staticmethod
    async def create_class(db: AsyncSession, body: ClassCreate) -> Class:
        row = Class(name=body.name)
        return await ClassRepository.create(db, row)

    @staticmethod
    async def get_class(db: AsyncSession, class_id: int) -> Class:
        row = await ClassRepository.get_by_id(db, class_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Class not found")
        return row

    @staticmethod
    async def list_classes(
        db: AsyncSession, *, limit: int = 50, offset: int = 0
    ) -> List[Class]:
        return await ClassRepository.list_classes(db, limit=limit, offset=offset)

    @staticmethod
    async def update_class(
        db: AsyncSession, class_id: int, body: ClassUpdate
    ) -> Class:
        row = await ClassRepository.get_by_id(db, class_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Class not found")

        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(row, field, value)

        await db.commit()
        await db.refresh(row)
        return row

    @staticmethod
    async def delete_class(
        db: AsyncSession,
        class_id: int,
        *,
        deleted_by_user_id: int,
    ) -> Dict[str, str]:
        row = await ClassRepository.get_by_id(db, class_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Class not found")

        row.is_deleted = True
        row.deleted_at = datetime.utcnow()
        row.deleted_by = deleted_by_user_id
        row.deleted_reason = "Deleted via API"

        await db.commit()
        return {"message": "deleted"}

