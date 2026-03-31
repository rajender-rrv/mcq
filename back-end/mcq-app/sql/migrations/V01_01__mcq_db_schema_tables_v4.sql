
-- Create a dedicated schema and move MCQ tables out of public.
-- This keeps object ownership/visibility clean while allowing the app to use search_path.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS mcq;
SET search_path TO mcq, public;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CLASSES / SUBJECTS / CATEGORIES
-- ============================================================
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
        CHECK (name IN ('EASY', 'MEDIUM', 'HARD'))
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    explanation TEXT,

    class_id INT NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    created_by INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    parent_question_id INT REFERENCES questions(id),

    normalized_question_text TEXT,
    question_hash TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    deleted_at TIMESTAMP,
    deleted_by INT REFERENCES users(id),
    deleted_reason TEXT
);

-- Prevent duplicate active questions
CREATE UNIQUE INDEX unique_active_question
ON questions(normalized_question_text)
WHERE is_deleted = FALSE;

-- Performance indexes
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_class ON questions(class_id);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_deleted = FALSE;
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_question_hash ON questions(question_hash);

-- ============================================================
-- QUESTION OPTIONS
-- ============================================================
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_options_question ON question_options(question_id);

-- Ensure ONLY ONE correct option per question
CREATE UNIQUE INDEX one_correct_option_per_question
ON question_options(question_id)
WHERE is_correct = TRUE;

-- ============================================================
-- SETS (STATIC QUESTION GROUP)
-- ============================================================
CREATE TABLE sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE set_questions (
    set_id INT NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    PRIMARY KEY (set_id, question_id)
);

CREATE INDEX idx_set_questions_q ON set_questions(question_id);

-- ============================================================
-- TEST TEMPLATES
-- ============================================================
CREATE TABLE test_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,

    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,

    total_questions INT NOT NULL,
    duration INT, -- seconds

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    rules JSONB,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by INT REFERENCES users(id),
    deleted_reason TEXT
);

-- ============================================================
-- TEST ATTEMPTS
-- ============================================================
CREATE TABLE test_attempts (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id INT REFERENCES test_templates(id) ON DELETE SET NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
        CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),

    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,

    score INT DEFAULT 0
);

CREATE INDEX idx_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_attempts_status ON test_attempts(status);

-- ============================================================
-- QUESTIONS SHOWN IN ATTEMPT
-- ============================================================
CREATE TABLE test_attempt_questions (
    id SERIAL PRIMARY KEY,

    attempt_id INT NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,

    question_order INT NOT NULL,
    shown_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (attempt_id, question_id),
    UNIQUE (attempt_id, question_order)
);

CREATE INDEX idx_attempt_questions_attempt
ON test_attempt_questions(attempt_id);

CREATE INDEX idx_attempt_questions_question
ON test_attempt_questions(question_id);

-- Critical for ordering/pagination
CREATE INDEX idx_attempt_question_order
ON test_attempt_questions(attempt_id, question_order);

-- ============================================================
-- USER ANSWERS (UPDATED - LINKED TO ATTEMPT QUESTIONS)
-- ============================================================
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,

    attempt_question_id INT NOT NULL
        REFERENCES test_attempt_questions(id) ON DELETE CASCADE,

    selected_option_id INT NOT NULL
        REFERENCES question_options(id) ON DELETE RESTRICT,

    is_correct BOOLEAN NOT NULL,

    answered_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Ensure only one answer per question per attempt
    UNIQUE (attempt_question_id)
);

-- Performance indexes
CREATE INDEX idx_answers_attempt_question
ON user_answers(attempt_question_id);

