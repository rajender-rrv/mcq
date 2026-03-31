-- Tags and question–tag associations.
-- Source: ../tags_migration.sql

CREATE TABLE IF NOT EXISTS mcq.tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS mcq.question_tags (
    question_id INTEGER NOT NULL REFERENCES mcq.questions (id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES mcq.tags (id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON mcq.question_tags (tag_id);

