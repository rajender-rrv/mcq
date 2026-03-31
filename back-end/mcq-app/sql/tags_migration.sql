-- Tags and question–tag associations. Run against your MCQ PostgreSQL database.

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags (tag_id);
