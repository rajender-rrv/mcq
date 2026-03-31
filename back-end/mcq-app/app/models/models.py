from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Integer, String, Text, Boolean, ForeignKey,
    TIMESTAMP, CheckConstraint, Index, UniqueConstraint, text
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


# =========================
# USERS
# =========================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), server_default=text("'user'"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    __table_args__ = (
        CheckConstraint(
            "role IN ('user', 'admin')",
            name="ck_users_role",
        ),
    )


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    __table_args__ = (Index("idx_refresh_tokens_user", "user_id"),)


# =========================
# CLASSES
# =========================
class Class(Base):
    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)


# =========================
# SUBJECTS
# =========================
class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id", ondelete="CASCADE"),
        nullable=False
    )


# =========================
# CATEGORIES
# =========================
class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint(
            "name IN ('EASY', 'MEDIUM', 'HARD')",
            name="ck_categories_name"
        ),
    )


# =========================
# QUESTIONS
# =========================
class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    class_id: Mapped[int] = mapped_column(
        ForeignKey("classes.id", ondelete="RESTRICT"), nullable=False
    )
    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.id", ondelete="RESTRICT"), nullable=False
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true"), nullable=False
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )

    parent_question_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("questions.id"), nullable=True
    )

    normalized_question_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    question_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    deleted_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    deleted_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        Index("idx_questions_subject", "subject_id"),
        Index("idx_questions_category", "category_id"),
        Index("idx_questions_class", "class_id"),
        Index(
            "idx_questions_active",
            "is_active",
            postgresql_where=text("is_deleted = false")
        ),
        Index(
            "idx_questions_created_at",
            text("created_at DESC")
        ),
        Index("idx_question_hash", "question_hash"),
        Index(
            "unique_active_question",
            "normalized_question_text",
            unique=True,
            postgresql_where=text("is_deleted = false")
        ),
    )


# =========================
# TAGS
# =========================
class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)


class QuestionTag(Base):
    __tablename__ = "question_tags"

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (Index("idx_question_tags_tag", "tag_id"),)


# =========================
# QUESTION OPTIONS
# =========================
class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False
    )

    option_text: Mapped[str] = mapped_column(Text, nullable=False)

    is_correct: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )

    __table_args__ = (
        Index("idx_options_question", "question_id"),
        Index(
            "one_correct_option_per_question",
            "question_id",
            unique=True,
            postgresql_where=text("is_correct = true")
        ),
    )


# =========================
# SETS
# =========================
class Set(Base):
    __tablename__ = "sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    subject_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("subjects.id", ondelete="SET NULL")
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL")
    )
    created_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )


# =========================
# SET QUESTIONS
# =========================
class SetQuestion(Base):
    __tablename__ = "set_questions"

    set_id: Mapped[int] = mapped_column(
        ForeignKey("sets.id", ondelete="CASCADE"), primary_key=True
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True
    )

    __table_args__ = (
        Index("idx_set_questions_q", "question_id"),
    )


# =========================
# TEST TEMPLATES
# =========================
class TestTemplate(Base):
    __tablename__ = "test_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    subject_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("subjects.id", ondelete="SET NULL")
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL")
    )

    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    rules: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    is_deleted: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false"), nullable=False
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)
    deleted_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id")
    )
    deleted_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


# =========================
# TEST ATTEMPTS
# =========================
class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    template_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("test_templates.id", ondelete="SET NULL")
    )

    status: Mapped[str] = mapped_column(
        String(20),
        server_default=text("'IN_PROGRESS'"),
        nullable=False
    )

    started_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP, nullable=True)

    score: Mapped[int] = mapped_column(
        Integer, server_default=text("0")
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('IN_PROGRESS', 'COMPLETED')",
            name="ck_test_attempts_status"
        ),
        Index("idx_attempts_user", "user_id"),
        Index("idx_attempts_status", "status"),
    )


# =========================
# TEST ATTEMPT QUESTIONS
# =========================
class TestAttemptQuestion(Base):
    __tablename__ = "test_attempt_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    attempt_id: Mapped[int] = mapped_column(
        ForeignKey("test_attempts.id", ondelete="CASCADE"),
        nullable=False
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id", ondelete="RESTRICT"),
        nullable=False
    )

    question_order: Mapped[int] = mapped_column(Integer, nullable=False)

    shown_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id"),
        UniqueConstraint("attempt_id", "question_order"),
        Index("idx_attempt_questions_attempt", "attempt_id"),
        Index("idx_attempt_questions_question", "question_id"),
        Index("idx_attempt_question_order", "attempt_id", "question_order"),
    )


# =========================
# USER ANSWERS
# =========================
class UserAnswer(Base):
    __tablename__ = "user_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    attempt_question_id: Mapped[int] = mapped_column(
        ForeignKey("test_attempt_questions.id", ondelete="CASCADE"),
        nullable=False
    )

    selected_option_id: Mapped[int] = mapped_column(
        ForeignKey("question_options.id", ondelete="RESTRICT"),
        nullable=False
    )

    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)

    answered_at: Mapped[datetime] = mapped_column(
        TIMESTAMP, server_default=text("now()"), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("attempt_question_id"),
        Index("idx_answers_attempt_question", "attempt_question_id"),
    )