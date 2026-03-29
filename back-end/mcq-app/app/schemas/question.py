from typing import List, Optional

from pydantic import BaseModel, Field


class QuestionOptionCreate(BaseModel):
    option_text: str
    is_correct: bool


class QuestionOptionOut(BaseModel):
    id: int
    option_text: str
    is_correct: bool

    class Config:
        from_attributes = True


class QuestionCreate(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    class_id: int
    subject_id: int
    category_id: int
    options: List[QuestionOptionCreate] = Field(min_length=1)


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    explanation: Optional[str] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    category_id: Optional[int] = None
    options: Optional[List[QuestionOptionCreate]] = None


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    explanation: Optional[str]
    class_id: int
    subject_id: int
    category_id: int
    options: List[QuestionOptionOut]

    class Config:
        from_attributes = True


class QuestionListItem(BaseModel):
    id: int
    question_text: str
    options: List[dict]
