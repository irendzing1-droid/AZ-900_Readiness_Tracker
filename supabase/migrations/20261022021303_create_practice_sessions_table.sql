/*
# Create practice_sessions table for AZ-900 Readiness Tracker

## Overview
This migration creates the `practice_sessions` table used by the AZ-900 Readiness Tracker app.
Each authenticated user logs their practice test sessions — date taken, score (0-1000 scale),
and the weakest domain identified — so they can track readiness over time.

## New Tables
- `practice_sessions`
  - `id` — uuid, primary key, auto-generated
  - `user_id` — uuid, foreign key to auth.users, defaults to the authenticated user (auth.uid())
  - `test_date` — date the practice test was taken
  - `score` — integer from 0 to 1000 (AZ-900 scoring scale)
  - `weakest_domain` — text constrained to: 'Cloud Concepts', 'Core Azure Services', 'Management & Governance', 'N/A'
  - `created_at` — timestamptz, defaults to now()

## Security
- Row Level Security is ENABLED on practice_sessions.
- Four owner-scoped policies (SELECT, INSERT, UPDATE, DELETE) restrict access to the owning
  authenticated user via `auth.uid() = user_id`.
- The `user_id` column defaults to `auth.uid()` so frontend inserts that omit `user_id`
  still satisfy the INSERT policy's WITH CHECK.

## Notes
1. The CHECK constraint on `score` enforces the 0-1000 range at the database level.
2. The CHECK constraint on `weakest_domain` enforces the allowed domain values.
3. ON DELETE CASCADE ensures a user's practice sessions are removed when the auth account is deleted.
*/

CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_date date NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 1000),
  weakest_domain text NOT NULL DEFAULT 'N/A' CHECK (
    weakest_domain IN ('Cloud Concepts', 'Core Azure Services', 'Management & Governance', 'N/A')
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON practice_sessions;
CREATE POLICY "select_own_sessions" ON practice_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON practice_sessions;
CREATE POLICY "insert_own_sessions" ON practice_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sessions" ON practice_sessions;
CREATE POLICY "update_own_sessions" ON practice_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON practice_sessions;
CREATE POLICY "delete_own_sessions" ON practice_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_test_date ON practice_sessions(test_date DESC);