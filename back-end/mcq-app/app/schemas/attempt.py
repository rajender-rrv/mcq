from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class StartAttemptRequest(BaseModel):
    template_id: int


class StartAttemptResponse(BaseModel):
    attempt_id: int
    template_id: int
    total_questions: int


class AttemptQuestionOptionOut(BaseModel):
    label: str
    id: int
    text: str


class AttemptQuestionItem(BaseModel):
    attempt_question_id: int
    question_order: int
    question_id: int
    question_text: str
    options: List[AttemptQuestionOptionOut]


class AttemptQuestionReviewItem(AttemptQuestionItem):
    """Same shape as in-progress questions, plus review fields after submission."""

    explanation: Optional[str] = None
    user_answer: AttemptQuestionOptionOut
    correct_answer: AttemptQuestionOptionOut


class AnswerItem(BaseModel):
    attempt_question_id: int
    selected_option_id: int


class SubmitAttemptRequest(BaseModel):
    answers: List[AnswerItem] = Field(min_length=1)


class SubmitAttemptResponse(BaseModel):
    attempt_id: int
    score: int
    total_questions: int
    status: str


class AttemptHistoryItem(BaseModel):
    id: int
    template_id: Optional[int]
    template_name: Optional[str]
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    score: int

    class Config:
        from_attributes = True
