from typing import Optional

from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    name: str = Field(..., max_length=50)
    class_id: int


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    class_id: Optional[int] = None


class SubjectOut(BaseModel):
    id: int
    name: str
    class_id: int
    is_deleted: bool

    class Config:
        from_attributes = True

