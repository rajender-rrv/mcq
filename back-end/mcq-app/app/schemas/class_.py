from typing import Optional

from pydantic import BaseModel, Field


class ClassCreate(BaseModel):
    name: str = Field(..., max_length=50)


class ClassUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)


class ClassOut(BaseModel):
    id: int
    name: str
    is_deleted: bool

    class Config:
        from_attributes = True

