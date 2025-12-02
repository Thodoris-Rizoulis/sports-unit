-- Migration: Add public_uuid to users and backfill
-- Requires Postgres with pgcrypto (gen_random_uuid)
BEGIN;

-- Create extension for gen_random_uuid if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add column (nullable initially)
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_uuid uuid;

-- Backfill existing rows where null
UPDATE users SET public_uuid = gen_random_uuid() WHERE public_uuid IS NULL;

-- Create unique index and set NOT NULL
CREATE UNIQUE INDEX IF NOT EXISTS users_public_uuid_idx ON users(public_uuid);
ALTER TABLE users ALTER COLUMN public_uuid SET NOT NULL;

COMMIT;

-- NOTE: Run this migration during a maintenance window for large tables.
