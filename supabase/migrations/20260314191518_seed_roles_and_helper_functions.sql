/*
  # Seed Data - System Roles and Helper Functions

  ## Overview
  Inserts system roles and creates utility functions for tenant management.

  ## System Roles
  Five predefined roles with specific permission sets for RBAC.

  ## Helper Functions
  - initialize_tenant: Sets up new tenant with defaults
  - log_credit_usage: Handles credit consumption
  - create_notification: Creates user notifications
*/

-- Insert system roles
INSERT INTO roles (id, tenant_id, name, description, permissions, is_system_role) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Super Admin',
    'Full system access across all tenants',
    '["system:*", "tenants:*", "users:*", "projects:*", "generations:*", "assets:*", "billing:*", "audit:*"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Tenant Owner',
    'Full access to tenant resources and settings',
    '["tenant:manage", "users:*", "roles:*", "projects:*", "generations:*", "assets:*", "billing:*", "integrations:*", "settings:*"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Tenant Admin',
    'Manage users and content within tenant',
    '["users:invite", "users:manage", "projects:*", "generations:*", "assets:*", "comments:*", "shares:*"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    NULL,
    'Content Creator',
    'Create and manage content',
    '["projects:create", "projects:read", "projects:update", "projects:delete", "generations:create", "generations:read", "generations:update", "assets:create", "assets:read", "assets:update", "comments:create", "comments:read", "shares:create"]'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    NULL,
    'Viewer',
    'Read-only access to content',
    '["projects:read", "generations:read", "assets:read", "comments:read"]'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Create function to initialize tenant with default settings
CREATE OR REPLACE FUNCTION initialize_tenant(tenant_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Create credit balance
  INSERT INTO credit_balances (tenant_id, credits_available, credits_purchased)
  VALUES (tenant_id_param, 100, 100)
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Create tenant settings
  INSERT INTO tenant_settings (
    tenant_id,
    branding,
    features_enabled,
    default_permissions,
    notification_settings
  ) VALUES (
    tenant_id_param,
    '{"logo_url": null, "primary_color": "#3b82f6", "custom_domain": null}'::jsonb,
    '{"image_generation": true, "video_generation": true, "upscaling": true, "api_access": false}'::jsonb,
    '{"default_sharing": "private", "allow_public_sharing": true, "require_approval": false}'::jsonb,
    '{"email_notifications": true, "push_notifications": true, "comment_notifications": true, "generation_complete": true}'::jsonb
  )
  ON CONFLICT (tenant_id) DO NOTHING;

  -- Grant initial credits transaction
  INSERT INTO credit_transactions (
    tenant_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    tenant_id_param,
    'grant',
    100,
    0,
    100,
    'Welcome bonus - 100 free credits'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log credit usage
CREATE OR REPLACE FUNCTION log_credit_usage(
  tenant_id_param uuid,
  user_id_param uuid,
  resource_type_param text,
  resource_id_param uuid,
  credits_amount numeric,
  metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
DECLARE
  current_balance numeric;
  new_balance numeric;
BEGIN
  -- Get current balance
  SELECT credits_available INTO current_balance
  FROM credit_balances
  WHERE tenant_id = tenant_id_param
  FOR UPDATE;
  
  -- Check if sufficient credits
  IF current_balance < credits_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Available: %, Required: %', current_balance, credits_amount;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - credits_amount;
  
  -- Update balance
  UPDATE credit_balances
  SET 
    credits_available = new_balance,
    credits_consumed = credits_consumed + credits_amount,
    updated_at = now()
  WHERE tenant_id = tenant_id_param;
  
  -- Log usage
  INSERT INTO usage_logs (
    tenant_id,
    user_id,
    resource_type,
    resource_id,
    credits_consumed,
    metadata
  ) VALUES (
    tenant_id_param,
    user_id_param,
    resource_type_param,
    resource_id_param,
    credits_amount,
    metadata_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id_param uuid,
  notification_type_param text,
  title_param text,
  message_param text,
  action_url_param text DEFAULT NULL,
  related_user_id_param uuid DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
  user_tenant_id uuid;
BEGIN
  -- Get user's tenant
  SELECT tenant_id INTO user_tenant_id
  FROM user_profiles
  WHERE id = user_id_param;
  
  IF user_tenant_id IS NULL THEN
    RAISE EXCEPTION 'User not found or not associated with a tenant';
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    tenant_id,
    user_id,
    notification_type,
    title,
    message,
    action_url,
    related_user_id,
    metadata
  ) VALUES (
    user_tenant_id,
    user_id_param,
    notification_type_param,
    title_param,
    message_param,
    action_url_param,
    related_user_id_param,
    metadata_param
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permission
CREATE OR REPLACE FUNCTION user_has_permission(
  user_id_param uuid,
  permission_param text
)
RETURNS boolean AS $$
DECLARE
  has_perm boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id_param
      AND (
        r.permissions @> to_jsonb(permission_param)
        OR r.permissions @> to_jsonb(split_part(permission_param, ':', 1) || ':*')
        OR r.permissions @> to_jsonb('system:*')
      )
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments to tables
COMMENT ON TABLE tenants IS 'Multi-tenant organizations/workspaces';
COMMENT ON TABLE user_profiles IS 'Extended user information linked to auth.users';
COMMENT ON TABLE roles IS 'RBAC role definitions (system and custom)';
COMMENT ON TABLE projects IS 'User workspaces for organizing content';
COMMENT ON TABLE generation_history IS 'AI generation tracking with multi-tenant support';
COMMENT ON TABLE assets IS 'User-uploaded and generated media files';
COMMENT ON TABLE usage_logs IS 'Resource consumption tracking for billing';
COMMENT ON TABLE credit_balances IS 'Current credit balance per tenant';
COMMENT ON TABLE credit_transactions IS 'Credit purchase and adjustment history';
COMMENT ON TABLE subscriptions IS 'Subscription plans and billing cycles';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';
COMMENT ON TABLE shared_content IS 'Content sharing with external users';
COMMENT ON TABLE comments IS 'Collaboration comments on content';
COMMENT ON TABLE notifications IS 'Real-time user notifications';
COMMENT ON TABLE team_invitations IS 'Tenant member invitations';
COMMENT ON TABLE tenant_settings IS 'Tenant-specific configuration';
COMMENT ON TABLE model_configurations IS 'Custom AI model settings per tenant';