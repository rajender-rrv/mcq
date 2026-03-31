-- Dedup support for questions.
-- Note: Base schema V4 already contains these columns/indexes; this migration is safe
-- to run for environments created from older schemas.

ALTER TABLE mcq.questions
    ADD COLUMN IF NOT EXISTS normalized_question_text TEXT,
    ADD COLUMN IF NOT EXISTS question_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_questions_question_hash ON mcq.questions (question_hash);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_question
    ON mcq.questions (normalized_question_text)
    WHERE is_deleted = false;

