from datetime import datetime
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import TestTemplate
from app.repositories.template_repo import TemplateRepository
from app.schemas.template import TemplateCreate, TemplateUpdate


class TemplateService:

    @staticmethod
    async def create_template(db: AsyncSession, body: TemplateCreate) -> TestTemplate:
        template = TestTemplate(
            name=body.name,
            subject_id=body.subject_id,
            category_id=body.category_id,
            total_questions=body.total_questions,
            duration=body.duration,
            rules=body.rules,
        )
        return await TemplateRepository.create(db, template)

    @staticmethod
    async def get_template(db: AsyncSession, template_id: int) -> TestTemplate:
        template = await TemplateRepository.get_by_id(db, template_id)
        if template is None or template.is_deleted:
            raise HTTPException(status_code=404, detail="Template not found")
        return template

    @staticmethod
    async def list_templates(
        db: AsyncSession,
        *,
        subject_id: Optional[int] = None,
        category_id: Optional[int] = None,
        limit: int = 10,
        offset: int = 0,
    ) -> List[TestTemplate]:
        return await TemplateRepository.list_templates(
            db,
            subject_id=subject_id,
            category_id=category_id,
            limit=limit,
            offset=offset,
        )

    @staticmethod
    async def update_template(
        db: AsyncSession, template_id: int, body: TemplateUpdate
    ) -> TestTemplate:
        template = await TemplateRepository.get_by_id(db, template_id)
        if template is None or template.is_deleted:
            raise HTTPException(status_code=404, detail="Template not found")

        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(template, field, value)

        await db.commit()
        await db.refresh(template)
        return template

    @staticmethod
    async def delete_template(
        db: AsyncSession,
        template_id: int,
        *,
        deleted_by_user_id: int,
    ) -> Dict[str, str]:
        template = await TemplateRepository.get_by_id(db, template_id)
        if template is None or template.is_deleted:
            raise HTTPException(status_code=404, detail="Template not found")

        template.is_deleted = True
        template.deleted_at = datetime.utcnow()
        template.deleted_by = deleted_by_user_id
        template.deleted_reason = "Deleted via API"

        await db.commit()
        return {"message": "deleted"}
