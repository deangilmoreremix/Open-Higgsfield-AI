-- 20260630_director_backend_tables.sql
-- Adds user_integrations and jobs tables for director-backend

CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_type TEXT NOT NULL
    CHECK (integration_type IN ('slack', 'hubspot', 'salesforce')),
  credentials_encrypted BYTEA NOT NULL,
  iv BYTEA NOT NULL,
  auth_tag BYTEA NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, integration_type)
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input JSONB,
  output JSONB,
  error_message TEXT,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own integrations" ON user_integrations;
CREATE POLICY "Users manage own integrations"
  ON user_integrations FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own jobs" ON jobs;
CREATE POLICY "Users see own jobs"
  ON jobs FOR ALL
  USING (auth.uid() = user_id);
