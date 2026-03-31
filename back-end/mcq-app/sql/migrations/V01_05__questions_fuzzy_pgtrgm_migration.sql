-- Fuzzy duplicate suggestions for questions (PostgreSQL).
-- Source: ../questions_fuzzy_pgtrgm_migration.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_questions_norm_trgm_active
ON mcq.questions USING GIN (normalized_question_text gin_trgm_ops)
WHERE is_deleted = false;

