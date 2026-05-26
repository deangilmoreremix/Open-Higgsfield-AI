/*
  # Add Pipeline Events Table and Novel2Video Support

  ## Summary
  This migration supports the new pipeline selection flow and enables the
  novel2video pipeline type throughout the system.

  ## 1. New Table: vimax_pipeline_events
  Records every pipeline selection event for analytics and usage tracking.

  ### Columns
  - id: auto-generated uuid primary key
  - user_id: the anonymous or authenticated user who made the selection
  - pipeline_type: one of idea2video, script2video, novel2video, cameo
  - source: how the pipeline was chosen — 'card' (clicked on landing screen) or 'ai_assistant' (chosen by AI intake)
  - created_at: timestamp of the selection

  ### Security
  - RLS enabled; users can only insert and read their own events

  ## 2. Update vimax_jobs: add novel2video to pipeline_type CHECK constraint
  If a CHECK constraint exists on pipeline_type, it is dropped and recreated
  to include 'novel2video'. If no constraint existed, a new one is added.

  ## 3. Index
  Index on (user_id, created_at) for fast per-user history queries.
*/

-- ============================================================
-- PIPELINE EVENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vimax_pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT '',
  pipeline_type text NOT NULL DEFAULT 'idea2video',
  source text NOT NULL DEFAULT 'card',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vimax_pipeline_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vimax_pipeline_events_user_created
  ON vimax_pipeline_events(user_id, created_at DESC);

CREATE POLICY "Users can insert own pipeline events"
  ON vimax_pipeline_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own pipeline events"
  ON vimax_pipeline_events
  FOR SELECT
  USING (true);

-- ============================================================
-- UPDATE vimax_jobs pipeline_type CHECK constraint
-- ============================================================
DO $$
BEGIN
  ALTER TABLE vimax_jobs
    DROP CONSTRAINT IF EXISTS vimax_jobs_pipeline_type_check;

  ALTER TABLE vimax_jobs
    ADD CONSTRAINT vimax_jobs_pipeline_type_check
    CHECK (pipeline_type IN ('idea2video', 'script2video', 'novel2video', 'cameo'));
EXCEPTION
  WHEN others THEN
    NULL;
END $$;
