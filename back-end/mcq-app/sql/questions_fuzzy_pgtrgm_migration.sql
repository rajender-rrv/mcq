-- Fuzzy duplicate suggestions for questions (PostgreSQL).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Speed up similarity() search against active questions.
CREATE INDEX IF NOT EXISTS idx_questions_norm_trgm_active
ON questions USING GIN (normalized_question_text gin_trgm_ops)
WHERE is_deleted = false;

