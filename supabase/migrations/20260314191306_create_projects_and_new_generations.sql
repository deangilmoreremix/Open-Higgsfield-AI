/*
  # Multi-Tenant Schema - Part 2: Projects and Enhanced Generations

  ## Overview
  Creates tables for organizing work into projects and enhanced generation tracking.
  Works alongside existing generations table.

  ## Tables Created

  ### 1. projects
  Workspaces for organizing related generations and assets.
  - `id` (uuid, PK): Project identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `created_by` (uuid, FK to user_profiles): Creator
  - `name` (text): Project name
  - `description` (text): Project purpose
  - `thumbnail_url` (text): Preview image
  - `status` (text): Project state (active, archived)
  - `settings` (jsonb): Project-specific configuration
  - `tags` (text[]): Searchable labels
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification

  ### 2. generation_history
  Enhanced tracking of AI generations with multi-tenant support.
  - `id` (uuid, PK): Generation identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `project_id` (uuid, FK to projects): Project association
  - `user_id` (uuid, FK to user_profiles): Creator
  - `studio_type` (text): Which studio was used
  - `generation_type` (text): Output type (image, video, audio)
  - `model_name` (text): AI model used
  - `prompt` (text): User input prompt
  - `negative_prompt` (text): Exclusion instructions
  - `parameters` (jsonb): Generation settings
  - `input_assets` (jsonb): Source files/references
  - `output_url` (text): Generated media URL
  - `thumbnail_url` (text): Preview thumbnail
  - `status` (text): Generation state
  - `error_message` (text): Failure details
  - `processing_time_ms` (int): Generation duration
  - `cost_credits` (numeric): Resource consumption
  - `is_public` (boolean): Sharing flag
  - `metadata` (jsonb): Additional data
  - `created_at` (timestamptz): Submission time
  - `completed_at` (timestamptz): Finish time

  ### 3. generation_versions
  Tracks iterations and variations of generations.

  ### 4. assets
  User-uploaded and generated media files.

  ## Security
  - RLS enabled on all tables
  - Tenant isolation via policies
  - Project-based access control

  ## Indexes
  - Optimized for common query patterns
  - Tenant ID on all tables
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  settings jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enhanced generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  studio_type text NOT NULL CHECK (studio_type IN ('image', 'video', 'cinema', 'character', 'effects', 'edit', 'upscale', 'storyboard', 'commercial', 'influencer')),
  generation_type text NOT NULL CHECK (generation_type IN ('image', 'video', 'audio', 'text')),
  model_name text NOT NULL,
  prompt text NOT NULL,
  negative_prompt text,
  parameters jsonb DEFAULT '{}'::jsonb,
  input_assets jsonb DEFAULT '[]'::jsonb,
  output_url text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  error_message text,
  processing_time_ms int,
  cost_credits numeric(10, 4) DEFAULT 0,
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create generation_versions table
CREATE TABLE IF NOT EXISTS generation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  generation_history_id uuid NOT NULL REFERENCES generation_history(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  output_url text NOT NULL,
  parameters jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(generation_history_id, version_number)
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('image', 'video', 'audio', '3d', 'document', 'other')),
  thumbnail_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT ARRAY[]::text[],
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_generation_history_tenant_id ON generation_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_project_id ON generation_history(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_status ON generation_history(status);
CREATE INDEX IF NOT EXISTS idx_generation_history_studio_type ON generation_history(studio_type);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_is_public ON generation_history(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_generation_versions_generation_history_id ON generation_versions(generation_history_id);
CREATE INDEX IF NOT EXISTS idx_generation_versions_tenant_id ON generation_versions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_asset_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their tenant"
  ON projects FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects in their tenant"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- RLS Policies for generation_history
CREATE POLICY "Users can view generations in their tenant"
  ON generation_history FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Users can create generations in their tenant"
  ON generation_history FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own generations"
  ON generation_history FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own generations"
  ON generation_history FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- RLS Policies for generation_versions
CREATE POLICY "Users can view versions in their tenant"
  ON generation_versions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions in their tenant"
  ON generation_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- RLS Policies for assets
CREATE POLICY "Users can view assets in their tenant"
  ON assets FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Users can upload assets to their tenant"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();