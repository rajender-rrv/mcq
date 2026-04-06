from typing import Optional

from pydantic import BaseModel, Field, field_validator


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=20)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip()


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=20)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        return v.strip()


class CategoryOut(BaseModel):
    id: int
    name: str
    is_deleted: bool

    class Config:
        from_attributes = True
