-- PostgreSQL schema generated from mcq_db_schema_design.sql
-- Requires PostgreSQL 13+ (uses gen_random_uuid()).
-- Tables use IF NOT EXISTS so the script can be re-run safely (indexes likewise).

--------------------------------------------------------------------------------
-- users
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name       VARCHAR(50) NOT NULL,
    password        VARCHAR(30) NOT NULL,
    email           VARCHAR(50) NOT NULL,
    mobile_no       VARCHAR(15),
    gender          VARCHAR(2),
    address         VARCHAR(100),
    dob             INTEGER,
    is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    is_mobile_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_time    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_time    TIMESTAMP
);

--------------------------------------------------------------------------------
-- classes
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    class_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name      VARCHAR(20) NOT NULL,
    class_desc      VARCHAR(50),
    class_subjects  TEXT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    created_on      TIMESTAMP NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- subjects
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    subject_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name    VARCHAR(20) NOT NULL,
    subject_desc    VARCHAR(50),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    created_on      TIMESTAMP NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- categories  (PK: category_id)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    category_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name   VARCHAR(20) NOT NULL
        CHECK (category_name IN ('RANDOM', 'EASY', 'MEDIUM', 'ADVANCED')),
    category_desc   VARCHAR(50),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    created_on      TIMESTAMP NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- bulk_import
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bulk_import (
    bulk_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulk_desc           VARCHAR(50),
    created_by          UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    bulk_started_on     TIMESTAMP NOT NULL DEFAULT NOW(),
    bulk_ended_on       TIMESTAMP,
    status              VARCHAR(20) NOT NULL DEFAULT 'IN-PROGRESS'
        CHECK (status IN ('IN-PROGRESS', 'DONE')),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    questions_id_array  TEXT NOT NULL DEFAULT ''
);

COMMENT ON COLUMN bulk_import.questions_id_array IS 'Serialized array of question_id (e.g. JSON)';

--------------------------------------------------------------------------------
-- sets  (design typo subect_id corrected to subject_id)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sets (
    set_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_name         VARCHAR(20) NOT NULL,
    questions_array  TEXT,
    subject_id       UUID NOT NULL REFERENCES subjects (subject_id) ON DELETE RESTRICT,
    category_id      UUID NOT NULL REFERENCES categories (category_id) ON DELETE RESTRICT,
    points           INTEGER
);

COMMENT ON COLUMN sets.questions_array IS 'Array of question_code (serialized text / JSON)';

--------------------------------------------------------------------------------
-- questions
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    question_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    q_code          VARCHAR(20) NOT NULL,
    question        TEXT NOT NULL,
    options         TEXT,
    answer          VARCHAR(10),
    class_id        UUID NOT NULL REFERENCES classes (class_id) ON DELETE RESTRICT,
    subject_id      UUID NOT NULL REFERENCES subjects (subject_id) ON DELETE RESTRICT,
    category_id     UUID NOT NULL REFERENCES categories (category_id) ON DELETE RESTRICT,
    created_time    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    bulk_id         UUID REFERENCES bulk_import (bulk_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_class_id ON questions (class_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions (subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions (category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions (created_by);
CREATE INDEX IF NOT EXISTS idx_questions_bulk_id ON questions (bulk_id);

--------------------------------------------------------------------------------
-- profiles
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    profile_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_name    VARCHAR(255) NOT NULL,
    profile_desc    VARCHAR(50),
    dob             INTEGER,
    user_id         UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    class_id        UUID NOT NULL REFERENCES classes (class_id) ON DELETE RESTRICT,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_time    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_time    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_class_id ON profiles (class_id);

--------------------------------------------------------------------------------
-- tests
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tests (
    test_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_code           VARCHAR(20) NOT NULL,
    user_id             UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    set_id              UUID NOT NULL REFERENCES sets (set_id) ON DELETE RESTRICT,
    test_type           VARCHAR(50) NOT NULL DEFAULT 'NON_TIME_BASED'
        CHECK (test_type IN ('NON_TIME_BASED', 'TIME_BASE', 'QUIZ')),
    category_id         UUID NOT NULL REFERENCES categories (category_id) ON DELETE RESTRICT,
    subject_id          UUID NOT NULL REFERENCES subjects (subject_id) ON DELETE RESTRICT,
    status              VARCHAR(20) NOT NULL DEFAULT 'IN-PROGRESS'
        CHECK (status IN ('IN-PROGRESS', 'DONE')),
    user_ans_json       TEXT,
    created_on          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on          TIMESTAMP,
    total_question      INTEGER,
    total_correct_ans   INTEGER,
    result_points       INTEGER
);

COMMENT ON COLUMN tests.user_ans_json IS 'JSON: question_id to user_answer mappings';

CREATE INDEX IF NOT EXISTS idx_tests_user_id ON tests (user_id);
CREATE INDEX IF NOT EXISTS idx_tests_set_id ON tests (set_id);
