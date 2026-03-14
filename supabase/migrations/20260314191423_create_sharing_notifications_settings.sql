/*
  # Multi-Tenant Schema - Part 4: Sharing, Notifications, and Configuration

  ## Overview
  Creates tables for content sharing, team collaboration, notifications, and system configuration.

  ## Tables Created

  ### 1. shared_content
  Enables sharing generations and projects with external users.
  - `id` (uuid, PK): Share identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `shared_by` (uuid, FK to user_profiles): User who shared
  - `content_type` (text): What is shared (project, generation, asset)
  - `content_id` (uuid): Reference to shared content
  - `share_token` (text, unique): URL-safe share identifier
  - `share_type` (text): Public link or specific user
  - `shared_with_email` (text): Recipient email (if private)
  - `permissions` (text[]): Allowed actions (view, download, comment)
  - `password_hash` (text): Optional password protection
  - `expires_at` (timestamptz): Expiration timestamp
  - `view_count` (int): Number of views
  - `last_accessed_at` (timestamptz): Last view timestamp
  - `is_active` (boolean): Enable/disable flag
  - `metadata` (jsonb): Additional settings
  - `created_at` (timestamptz): Share creation

  ### 2. comments
  Collaboration through comments on generations and projects.
  - `id` (uuid, PK): Comment identifier
  - `tenant_id` (uuid, FK to tenants): Tenant scope
  - `content_type` (text): Commented resource type
  - `content_id` (uuid): Reference to content
  - `user_id` (uuid, FK to user_profiles): Commenter
  - `parent_comment_id` (uuid, FK to comments): For threaded replies
  - `content` (text): Comment text
  - `mentions` (uuid[]): Tagged users
  - `is_edited` (boolean): Edit flag
  - `is_deleted` (boolean): Soft delete flag
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification

  ### 3. notifications
  Real-time notifications for user activities.
  - `id` (uuid, PK): Notification identifier
  - `tenant_id` (uuid, FK to tenants): Tenant scope
  - `user_id` (uuid, FK to user_profiles): Recipient
  - `notification_type` (text): Event type
  - `title` (text): Notification title
  - `message` (text): Notification content
  - `action_url` (text): Deep link to related content
  - `related_user_id` (uuid, FK to user_profiles): Actor who triggered
  - `metadata` (jsonb): Additional context
  - `is_read` (boolean): Read status
  - `read_at` (timestamptz): When marked as read
  - `created_at` (timestamptz): Notification timestamp

  ### 4. team_invitations
  Manages invitations to join tenant organizations.
  - `id` (uuid, PK): Invitation identifier
  - `tenant_id` (uuid, FK to tenants): Inviting organization
  - `invited_email` (text): Invitee email
  - `invited_by` (uuid, FK to user_profiles): Inviter
  - `role` (text): Assigned role upon acceptance
  - `invitation_token` (text, unique): Secure token
  - `status` (text): Invitation state
  - `expires_at` (timestamptz): Expiration timestamp
  - `accepted_at` (timestamptz): Acceptance timestamp
  - `created_at` (timestamptz): Invitation creation

  ### 5. tenant_settings
  Tenant-specific configuration and preferences.
  - `tenant_id` (uuid, PK, FK to tenants): Tenant identifier
  - `branding` (jsonb): Logo, colors, custom domain
  - `features_enabled` (jsonb): Feature flags
  - `default_permissions` (jsonb): Default access settings
  - `integrations` (jsonb): Third-party service configs
  - `notification_settings` (jsonb): Notification preferences
  - `security_settings` (jsonb): Security policies
  - `updated_at` (timestamptz): Last configuration change

  ### 6. model_configurations
  Custom AI model settings per tenant.
  - `id` (uuid, PK): Configuration identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `model_name` (text): AI model identifier
  - `studio_type` (text): Applicable studio
  - `default_parameters` (jsonb): Default generation settings
  - `is_enabled` (boolean): Availability flag
  - `custom_endpoint` (text): Optional custom API endpoint
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification

  ## Security
  - RLS enabled on all tables
  - Share tokens are cryptographically secure
  - Password hashes never stored in plain text
  - Notifications isolated to recipients

  ## Indexes
  - Optimized for real-time features
  - Share token lookups
  - Unread notification queries
*/

-- Create shared_content table
CREATE TABLE IF NOT EXISTS shared_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('project', 'generation', 'asset', 'storyboard')),
  content_id uuid NOT NULL,
  share_token text UNIQUE NOT NULL,
  share_type text NOT NULL DEFAULT 'public' CHECK (share_type IN ('public', 'private', 'password_protected')),
  shared_with_email text,
  permissions text[] DEFAULT ARRAY['view']::text[],
  password_hash text,
  expires_at timestamptz,
  view_count int DEFAULT 0,
  last_accessed_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('project', 'generation', 'asset')),
  content_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  mentions uuid[] DEFAULT ARRAY[]::uuid[],
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('comment', 'mention', 'share', 'generation_complete', 'generation_failed', 'credit_low', 'team_invite', 'role_change')),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  related_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invitation_token text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create tenant_settings table
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  branding jsonb DEFAULT '{}'::jsonb,
  features_enabled jsonb DEFAULT '{}'::jsonb,
  default_permissions jsonb DEFAULT '{}'::jsonb,
  integrations jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{}'::jsonb,
  security_settings jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Create model_configurations table
CREATE TABLE IF NOT EXISTS model_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  studio_type text NOT NULL,
  default_parameters jsonb DEFAULT '{}'::jsonb,
  is_enabled boolean DEFAULT true,
  custom_endpoint text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, model_name, studio_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_content_tenant_id ON shared_content(tenant_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_share_token ON shared_content(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_content_content ON shared_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_shared_content_is_active ON shared_content(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_comments_tenant_id ON comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_team_invitations_tenant_id ON team_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_email ON team_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

CREATE INDEX IF NOT EXISTS idx_model_configurations_tenant_id ON model_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_model_configurations_is_enabled ON model_configurations(is_enabled) WHERE is_enabled = true;

-- Enable Row Level Security
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_content
CREATE POLICY "Users can view shares in their tenant"
  ON shared_content FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares in their tenant"
  ON shared_content FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND shared_by = auth.uid()
  );

CREATE POLICY "Users can update their own shares"
  ON shared_content FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND shared_by = auth.uid()
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for comments
CREATE POLICY "Users can view comments in their tenant"
  ON comments FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments in their tenant"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
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

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for team_invitations
CREATE POLICY "Users can view invitations for their tenant"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage invitations"
  ON team_invitations FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  );

-- RLS Policies for tenant_settings
CREATE POLICY "Users can view their tenant settings"
  ON tenant_settings FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage settings"
  ON tenant_settings FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  );

-- RLS Policies for model_configurations
CREATE POLICY "Users can view model configs in their tenant"
  ON model_configurations FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage model configs"
  ON model_configurations FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_configurations_updated_at
  BEFORE UPDATE ON model_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();