from pydantic import BaseModel
from typing import Optional, Dict


class TemplateCreate(BaseModel):
    name: str
    subject_id: Optional[int] = None
    category_id: Optional[int] = None
    total_questions: int
    duration: Optional[int] = None
    rules: Optional[Dict] = None


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject_id: Optional[int] = None
    category_id: Optional[int] = None
    total_questions: Optional[int] = None
    duration: Optional[int] = None
    rules: Optional[Dict] = None


class TemplateResponse(BaseModel):
    id: int
    name: str
    subject_id: Optional[int]
    category_id: Optional[int]
    total_questions: int
    duration: Optional[int]
    rules: Optional[Dict]
    is_deleted: bool

    class Config:
        from_attributes = True