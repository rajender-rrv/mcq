from typing import List, Optional

from pydantic import BaseModel, Field


class TagOut(BaseModel):
    id: int
    name: str
    slug: str

    class Config:
        from_attributes = True


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
    tags: Optional[List[str]] = None


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    explanation: Optional[str] = None
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    category_id: Optional[int] = None
    options: Optional[List[QuestionOptionCreate]] = None
    tags: Optional[List[str]] = None


class QuestionResponse(BaseModel):
    id: int
    question_text: str
    explanation: Optional[str]
    class_id: int
    subject_id: int
    category_id: int
    options: List[QuestionOptionOut]
    tags: List[TagOut] = Field(default_factory=list)

    class Config:
        from_attributes = True


class QuestionListItem(BaseModel):
    id: int
    question_text: str
    options: List[dict]
    tags: List[TagOut] = Field(default_factory=list)


class QuestionDuplicateCheckRequest(BaseModel):
    question_text: str
    threshold: float = Field(default=0.88, ge=0.0, le=1.0)
    limit: int = Field(default=5, ge=1, le=20)

    # Optional scoping (recommended so results are relevant).
    class_id: Optional[int] = None
    subject_id: Optional[int] = None
    category_id: Optional[int] = None


class QuestionDuplicateCandidate(BaseModel):
    id: int
    question_text: str
    score: float


class QuestionDuplicateCheckResponse(BaseModel):
    normalized_question_text: str
    candidates: List[QuestionDuplicateCandidate] = Field(default_factory=list)
