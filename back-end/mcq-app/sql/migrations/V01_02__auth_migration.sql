-- Auth-related schema updates.
-- Source: ../auth_migration.sql

ALTER TABLE mcq.users
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE mcq.users
    DROP CONSTRAINT IF EXISTS ck_users_role;

ALTER TABLE mcq.users
    ADD CONSTRAINT ck_users_role CHECK (role IN ('user', 'admin'));

CREATE TABLE IF NOT EXISTS mcq.refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES mcq.users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON mcq.refresh_tokens (user_id);

