-- Add soft-delete to classes/categories/subjects and introduce subject_resources.
SET search_path TO mcq, public;

ALTER TABLE mcq.classes
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS deleted_by INT NULL REFERENCES mcq.users(id),
    ADD COLUMN IF NOT EXISTS deleted_reason TEXT NULL;

ALTER TABLE mcq.categories
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS deleted_by INT NULL REFERENCES mcq.users(id),
    ADD COLUMN IF NOT EXISTS deleted_reason TEXT NULL;

ALTER TABLE mcq.subjects
    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS deleted_by INT NULL REFERENCES mcq.users(id),
    ADD COLUMN IF NOT EXISTS deleted_reason TEXT NULL;


