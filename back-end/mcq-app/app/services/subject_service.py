from datetime import datetime
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import Subject
from app.repositories.subject_repo import SubjectRepository
from app.schemas.subject import SubjectCreate, SubjectUpdate


class SubjectService:

    @staticmethod
    async def create_subject(db: AsyncSession, body: SubjectCreate) -> Subject:
        row = Subject(name=body.name, class_id=body.class_id)
        return await SubjectRepository.create(db, row)

    @staticmethod
    async def get_subject(db: AsyncSession, subject_id: int) -> Subject:
        row = await SubjectRepository.get_by_id(db, subject_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Subject not found")
        return row

    @staticmethod
    async def list_subjects(
        db: AsyncSession,
        *,
        class_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Subject]:
        return await SubjectRepository.list_subjects(
            db, class_id=class_id, limit=limit, offset=offset
        )

    @staticmethod
    async def update_subject(
        db: AsyncSession, subject_id: int, body: SubjectUpdate
    ) -> Subject:
        row = await SubjectRepository.get_by_id(db, subject_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Subject not found")

        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(row, field, value)

        await db.commit()
        await db.refresh(row)
        return row

    @staticmethod
    async def delete_subject(
        db: AsyncSession,
        subject_id: int,
        *,
        deleted_by_user_id: int,
    ) -> Dict[str, str]:
        row = await SubjectRepository.get_by_id(db, subject_id)
        if row is None or row.is_deleted:
            raise HTTPException(status_code=404, detail="Subject not found")

        row.is_deleted = True
        row.deleted_at = datetime.utcnow()
        row.deleted_by = deleted_by_user_id
        row.deleted_reason = "Deleted via API"

        await db.commit()
        return {"message": "deleted"}

