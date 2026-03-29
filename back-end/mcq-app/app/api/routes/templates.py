from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.template import TemplateCreate, TemplateResponse, TemplateUpdate
from app.services.template_service import TemplateService

router = APIRouter()


@router.post("/", status_code=201, response_model=TemplateResponse)
async def create_template(body: TemplateCreate, db: AsyncSession = Depends(get_db)):
    return await TemplateService.create_template(db, body)


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    subject_id: Optional[int] = None,
    category_id: Optional[int] = None,
    limit: int = Query(10, le=100),
    offset: int = 0,
):
    return await TemplateService.list_templates(
        db,
        subject_id=subject_id,
        category_id=category_id,
        limit=limit,
        offset=offset,
    )


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: int, db: AsyncSession = Depends(get_db)):
    return await TemplateService.get_template(db, template_id)


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: int,
    body: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await TemplateService.update_template(db, template_id, body)


@router.delete("/{template_id}")
async def delete_template(template_id: int, db: AsyncSession = Depends(get_db)):
    return await TemplateService.delete_template(db, template_id)
