-- =====================================================
-- SAMPLE QUERIES FOR MULTI-TENANT DATABASE
-- =====================================================
-- This file contains example SQL queries demonstrating
-- how to interact with the multi-tenant database.
-- =====================================================

-- =====================================================
-- 1. TENANT MANAGEMENT
-- =====================================================

-- Create a new tenant
INSERT INTO tenants (name, slug, plan_type, status)
VALUES ('Acme Studios', 'acme-studios', 'pro', 'active')
RETURNING id;

-- Get tenant details with credit balance
SELECT
  t.id,
  t.name,
  t.slug,
  t.plan_type,
  t.status,
  t.max_users,
  t.max_storage_gb,
  cb.credits_available,
  cb.credits_consumed,
  cb.credits_purchased
FROM tenants t
LEFT JOIN credit_balances cb ON cb.tenant_id = t.id
WHERE t.id = 'your-tenant-uuid';

-- Update tenant plan
UPDATE tenants
SET plan_type = 'enterprise',
    max_users = 50,
    max_storage_gb = 500
WHERE id = 'your-tenant-uuid';

-- =====================================================
-- 2. USER MANAGEMENT
-- =====================================================

-- Create user profile (typically done automatically on signup)
INSERT INTO user_profiles (
  id,
  tenant_id,
  email,
  full_name,
  role,
  is_tenant_admin
) VALUES (
  'user-uuid',
  'tenant-uuid',
  'user@example.com',
  'John Doe',
  'member',
  false
);

-- Assign role to user
INSERT INTO user_roles (user_id, role_id, tenant_id, granted_by)
VALUES (
  'user-uuid',
  '00000000-0000-0000-0000-000000000004', -- Content Creator role
  'tenant-uuid',
  'admin-user-uuid'
);

-- Get user's complete profile with roles and permissions
SELECT
  up.id,
  up.email,
  up.full_name,
  up.avatar_url,
  up.role,
  up.is_tenant_admin,
  t.name as tenant_name,
  t.plan_type,
  ARRAY_AGG(DISTINCT r.name) as roles,
  JSONB_AGG(DISTINCT r.permissions) as all_permissions
FROM user_profiles up
JOIN tenants t ON t.id = up.tenant_id
LEFT JOIN user_roles ur ON ur.user_id = up.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE up.id = 'user-uuid'
GROUP BY up.id, t.id;

-- List all users in a tenant
SELECT
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.is_tenant_admin,
  up.last_login_at,
  up.created_at,
  COUNT(gh.id) as total_generations
FROM user_profiles up
LEFT JOIN generation_history gh ON gh.user_id = up.id
WHERE up.tenant_id = 'tenant-uuid'
GROUP BY up.id
ORDER BY up.created_at DESC;

-- =====================================================
-- 3. PROJECT MANAGEMENT
-- =====================================================

-- Create a new project
INSERT INTO projects (tenant_id, created_by, name, description, tags)
VALUES (
  'tenant-uuid',
  'user-uuid',
  'Summer Campaign 2024',
  'Marketing materials for summer product launch',
  ARRAY['marketing', 'summer', 'campaign']
)
RETURNING id;

-- Get all projects for a tenant with stats
SELECT
  p.id,
  p.name,
  p.description,
  p.thumbnail_url,
  p.status,
  p.tags,
  p.created_at,
  up.full_name as creator_name,
  COUNT(DISTINCT gh.id) as generation_count,
  COUNT(DISTINCT a.id) as asset_count,
  MAX(gh.created_at) as last_activity
FROM projects p
JOIN user_profiles up ON up.id = p.created_by
LEFT JOIN generation_history gh ON gh.project_id = p.id
LEFT JOIN assets a ON a.project_id = p.id
WHERE p.tenant_id = 'tenant-uuid'
  AND p.status = 'active'
GROUP BY p.id, up.full_name
ORDER BY last_activity DESC NULLS LAST;

-- Archive a project
UPDATE projects
SET status = 'archived',
    updated_at = NOW()
WHERE id = 'project-uuid'
  AND tenant_id = 'tenant-uuid';

-- Search projects by tag
SELECT p.*
FROM projects p
WHERE p.tenant_id = 'tenant-uuid'
  AND 'marketing' = ANY(p.tags)
  AND p.status = 'active';

-- =====================================================
-- 4. GENERATION MANAGEMENT
-- =====================================================

-- Create a new generation
INSERT INTO generation_history (
  tenant_id,
  project_id,
  user_id,
  studio_type,
  generation_type,
  model_name,
  prompt,
  negative_prompt,
  parameters,
  cost_credits,
  status
) VALUES (
  'tenant-uuid',
  'project-uuid',
  'user-uuid',
  'image',
  'image',
  'flux-pro',
  'A majestic mountain landscape at sunset',
  'blurry, low quality',
  '{"width": 1024, "height": 1024, "steps": 30, "guidance": 7.5}'::jsonb,
  2.5,
  'pending'
)
RETURNING id;

-- Update generation status when complete
UPDATE generation_history
SET status = 'completed',
    output_url = 'https://storage.example.com/outputs/abc123.jpg',
    thumbnail_url = 'https://storage.example.com/thumbnails/abc123_thumb.jpg',
    processing_time_ms = 3500,
    completed_at = NOW()
WHERE id = 'generation-uuid';

-- Get user's recent generations
SELECT
  gh.id,
  gh.prompt,
  gh.model_name,
  gh.studio_type,
  gh.generation_type,
  gh.output_url,
  gh.thumbnail_url,
  gh.status,
  gh.cost_credits,
  gh.created_at,
  gh.completed_at,
  p.name as project_name,
  COUNT(gv.id) as version_count
FROM generation_history gh
LEFT JOIN projects p ON p.id = gh.project_id
LEFT JOIN generation_versions gv ON gv.generation_history_id = gh.id
WHERE gh.tenant_id = 'tenant-uuid'
  AND gh.user_id = 'user-uuid'
GROUP BY gh.id, p.name
ORDER BY gh.created_at DESC
LIMIT 50;

-- Get generations by studio type
SELECT
  studio_type,
  COUNT(*) as total_generations,
  COUNT(*) FILTER (WHERE status = 'completed') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  AVG(processing_time_ms) as avg_processing_time,
  SUM(cost_credits) as total_credits
FROM generation_history
WHERE tenant_id = 'tenant-uuid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY studio_type
ORDER BY total_generations DESC;

-- Get public generations for explore page
SELECT
  gh.id,
  gh.prompt,
  gh.model_name,
  gh.output_url,
  gh.thumbnail_url,
  gh.created_at,
  up.full_name as creator_name,
  up.avatar_url as creator_avatar
FROM generation_history gh
JOIN user_profiles up ON up.id = gh.user_id
WHERE gh.is_public = true
  AND gh.status = 'completed'
ORDER BY gh.created_at DESC
LIMIT 100;

-- =====================================================
-- 5. ASSET MANAGEMENT
-- =====================================================

-- Upload a new asset
INSERT INTO assets (
  tenant_id,
  project_id,
  user_id,
  file_name,
  file_path,
  file_size_bytes,
  mime_type,
  asset_type,
  metadata,
  tags
) VALUES (
  'tenant-uuid',
  'project-uuid',
  'user-uuid',
  'product-photo.jpg',
  'uploads/tenant-uuid/products/photo123.jpg',
  2458624, -- bytes
  'image/jpeg',
  'image',
  '{"width": 3000, "height": 2000, "camera": "Canon EOS R5"}'::jsonb,
  ARRAY['product', 'photography']
)
RETURNING id;

-- Get all assets in a project
SELECT
  a.id,
  a.file_name,
  a.file_path,
  a.file_size_bytes,
  a.mime_type,
  a.asset_type,
  a.thumbnail_url,
  a.tags,
  a.created_at,
  up.full_name as uploaded_by
FROM assets a
JOIN user_profiles up ON up.id = a.user_id
WHERE a.project_id = 'project-uuid'
  AND a.tenant_id = 'tenant-uuid'
ORDER BY a.created_at DESC;

-- Calculate storage usage by tenant
SELECT
  t.name as tenant_name,
  t.max_storage_gb,
  COUNT(a.id) as total_files,
  SUM(a.file_size_bytes) as total_bytes,
  ROUND(SUM(a.file_size_bytes) / 1024.0 / 1024.0 / 1024.0, 2) as used_gb,
  ROUND((SUM(a.file_size_bytes) / 1024.0 / 1024.0 / 1024.0) / t.max_storage_gb * 100, 1) as usage_percent
FROM tenants t
LEFT JOIN assets a ON a.tenant_id = t.id
WHERE t.id = 'tenant-uuid'
GROUP BY t.id;

-- =====================================================
-- 6. CREDIT & BILLING MANAGEMENT
-- =====================================================

-- Initialize tenant with credits
SELECT initialize_tenant('tenant-uuid');

-- Add credits to tenant
DO $$
DECLARE
  current_balance numeric;
  new_balance numeric;
BEGIN
  SELECT credits_available INTO current_balance
  FROM credit_balances
  WHERE tenant_id = 'tenant-uuid';

  new_balance := current_balance + 500;

  UPDATE credit_balances
  SET credits_available = new_balance,
      credits_purchased = credits_purchased + 500,
      last_recharged_at = NOW()
  WHERE tenant_id = 'tenant-uuid';

  INSERT INTO credit_transactions (
    tenant_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    payment_method,
    payment_reference
  ) VALUES (
    'tenant-uuid',
    'purchase',
    500,
    current_balance,
    new_balance,
    'Credit purchase - 500 credits',
    'stripe',
    'ch_3abc123xyz'
  );
END $$;

-- Deduct credits for a generation
SELECT log_credit_usage(
  'tenant-uuid',
  'user-uuid',
  'generation',
  'generation-uuid',
  2.5,
  '{"model": "flux-pro", "resolution": "1024x1024"}'::jsonb
);

-- Get credit balance and usage history
SELECT
  cb.credits_available,
  cb.credits_consumed,
  cb.credits_purchased,
  cb.last_recharged_at,
  (SELECT COUNT(*) FROM usage_logs WHERE tenant_id = 'tenant-uuid' AND created_at >= NOW() - INTERVAL '30 days') as monthly_usage_count,
  (SELECT SUM(credits_consumed) FROM usage_logs WHERE tenant_id = 'tenant-uuid' AND created_at >= NOW() - INTERVAL '30 days') as monthly_credits_used
FROM credit_balances cb
WHERE cb.tenant_id = 'tenant-uuid';

-- Get detailed credit transaction history
SELECT
  ct.id,
  ct.transaction_type,
  ct.amount,
  ct.balance_before,
  ct.balance_after,
  ct.description,
  ct.payment_method,
  ct.payment_reference,
  ct.created_at,
  up.full_name as processed_by_name
FROM credit_transactions ct
LEFT JOIN user_profiles up ON up.id = ct.processed_by
WHERE ct.tenant_id = 'tenant-uuid'
ORDER BY ct.created_at DESC
LIMIT 100;

-- Usage analytics by resource type
SELECT
  DATE_TRUNC('day', ul.created_at) as date,
  ul.resource_type,
  ul.studio_type,
  COUNT(*) as usage_count,
  SUM(ul.credits_consumed) as total_credits,
  AVG(ul.credits_consumed) as avg_credits_per_use
FROM usage_logs ul
WHERE ul.tenant_id = 'tenant-uuid'
  AND ul.created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', ul.created_at), ul.resource_type, ul.studio_type
ORDER BY date DESC, total_credits DESC;

-- =====================================================
-- 7. SHARING & COLLABORATION
-- =====================================================

-- Create a public share link
INSERT INTO shared_content (
  tenant_id,
  shared_by,
  content_type,
  content_id,
  share_token,
  share_type,
  permissions,
  expires_at
) VALUES (
  'tenant-uuid',
  'user-uuid',
  'generation',
  'generation-uuid',
  encode(gen_random_bytes(16), 'hex'), -- Random secure token
  'public',
  ARRAY['view', 'download'],
  NOW() + INTERVAL '7 days'
)
RETURNING id, share_token;

-- Get shared content by token (public access)
SELECT
  sc.content_type,
  sc.content_id,
  sc.permissions,
  sc.expires_at,
  sc.is_active,
  CASE
    WHEN sc.content_type = 'generation' THEN (
      SELECT jsonb_build_object(
        'prompt', gh.prompt,
        'model', gh.model_name,
        'output_url', gh.output_url,
        'thumbnail_url', gh.thumbnail_url,
        'created_at', gh.created_at
      )
      FROM generation_history gh WHERE gh.id = sc.content_id
    )
  END as content_data
FROM shared_content sc
WHERE sc.share_token = 'token-here'
  AND sc.is_active = true
  AND (sc.expires_at IS NULL OR sc.expires_at > NOW());

-- Track share view
UPDATE shared_content
SET view_count = view_count + 1,
    last_accessed_at = NOW()
WHERE share_token = 'token-here';

-- Add comment to a generation
INSERT INTO comments (
  tenant_id,
  content_type,
  content_id,
  user_id,
  content,
  mentions
) VALUES (
  'tenant-uuid',
  'generation',
  'generation-uuid',
  'user-uuid',
  'Great work! Love the lighting in this one.',
  ARRAY[]::uuid[]
)
RETURNING id;

-- Get comments for content with user info
SELECT
  c.id,
  c.content,
  c.is_edited,
  c.created_at,
  c.updated_at,
  up.full_name as author_name,
  up.avatar_url as author_avatar,
  (SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.id) as reply_count
FROM comments c
JOIN user_profiles up ON up.id = c.user_id
WHERE c.content_type = 'generation'
  AND c.content_id = 'generation-uuid'
  AND c.is_deleted = false
  AND c.parent_comment_id IS NULL
ORDER BY c.created_at DESC;

-- =====================================================
-- 8. NOTIFICATIONS
-- =====================================================

-- Create notification for user
SELECT create_notification(
  'user-uuid',
  'generation_complete',
  'Your video is ready!',
  'The generation "Summer product showcase" has completed successfully.',
  '/projects/project-uuid/generations/generation-uuid',
  NULL,
  '{"generation_id": "generation-uuid"}'::jsonb
);

-- Get unread notifications for user
SELECT
  n.id,
  n.notification_type,
  n.title,
  n.message,
  n.action_url,
  n.created_at,
  up.full_name as related_user_name,
  up.avatar_url as related_user_avatar
FROM notifications n
LEFT JOIN user_profiles up ON up.id = n.related_user_id
WHERE n.user_id = 'user-uuid'
  AND n.is_read = false
ORDER BY n.created_at DESC;

-- Mark notification as read
UPDATE notifications
SET is_read = true,
    read_at = NOW()
WHERE id = 'notification-uuid'
  AND user_id = 'user-uuid';

-- Mark all notifications as read
UPDATE notifications
SET is_read = true,
    read_at = NOW()
WHERE user_id = 'user-uuid'
  AND is_read = false;

-- =====================================================
-- 9. TEAM INVITATIONS
-- =====================================================

-- Send team invitation
INSERT INTO team_invitations (
  tenant_id,
  invited_email,
  invited_by,
  role,
  invitation_token,
  expires_at
) VALUES (
  'tenant-uuid',
  'newuser@example.com',
  'admin-uuid',
  'member',
  encode(gen_random_bytes(32), 'hex'),
  NOW() + INTERVAL '7 days'
)
RETURNING id, invitation_token;

-- Get pending invitations for tenant
SELECT
  ti.id,
  ti.invited_email,
  ti.role,
  ti.status,
  ti.expires_at,
  ti.created_at,
  up.full_name as invited_by_name
FROM team_invitations ti
JOIN user_profiles up ON up.id = ti.invited_by
WHERE ti.tenant_id = 'tenant-uuid'
  AND ti.status = 'pending'
  AND ti.expires_at > NOW()
ORDER BY ti.created_at DESC;

-- Accept invitation
UPDATE team_invitations
SET status = 'accepted',
    accepted_at = NOW()
WHERE invitation_token = 'token-here'
  AND status = 'pending'
  AND expires_at > NOW();

-- =====================================================
-- 10. ANALYTICS & REPORTING
-- =====================================================

-- Dashboard overview for tenant
SELECT
  (SELECT COUNT(*) FROM user_profiles WHERE tenant_id = 'tenant-uuid') as total_users,
  (SELECT COUNT(*) FROM projects WHERE tenant_id = 'tenant-uuid' AND status = 'active') as active_projects,
  (SELECT COUNT(*) FROM generation_history WHERE tenant_id = 'tenant-uuid') as total_generations,
  (SELECT COUNT(*) FROM generation_history WHERE tenant_id = 'tenant-uuid' AND created_at >= NOW() - INTERVAL '30 days') as monthly_generations,
  (SELECT SUM(file_size_bytes) FROM assets WHERE tenant_id = 'tenant-uuid') as total_storage_bytes,
  (SELECT credits_available FROM credit_balances WHERE tenant_id = 'tenant-uuid') as credits_remaining;

-- User activity report
SELECT
  up.id,
  up.full_name,
  up.email,
  up.last_login_at,
  COUNT(DISTINCT gh.id) as total_generations,
  COUNT(DISTINCT p.id) as total_projects,
  COUNT(DISTINCT a.id) as total_uploads,
  SUM(ul.credits_consumed) as total_credits_used
FROM user_profiles up
LEFT JOIN generation_history gh ON gh.user_id = up.id
LEFT JOIN projects p ON p.created_by = up.id
LEFT JOIN assets a ON a.user_id = up.id
LEFT JOIN usage_logs ul ON ul.user_id = up.id
WHERE up.tenant_id = 'tenant-uuid'
GROUP BY up.id
ORDER BY total_generations DESC;

-- Monthly growth metrics
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_generations,
  COUNT(DISTINCT user_id) as active_users,
  SUM(cost_credits) as credits_consumed
FROM generation_history
WHERE tenant_id = 'tenant-uuid'
  AND created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Model usage statistics
SELECT
  model_name,
  studio_type,
  COUNT(*) as usage_count,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_count,
  AVG(processing_time_ms) as avg_processing_time,
  AVG(cost_credits) as avg_cost
FROM generation_history
WHERE tenant_id = 'tenant-uuid'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY model_name, studio_type
ORDER BY usage_count DESC;

-- =====================================================
-- 11. AUDIT & COMPLIANCE
-- =====================================================

-- Log an audit event
INSERT INTO audit_logs (
  tenant_id,
  user_id,
  action,
  resource_type,
  resource_id,
  changes,
  ip_address,
  user_agent
) VALUES (
  'tenant-uuid',
  'user-uuid',
  'project_deleted',
  'project',
  'project-uuid',
  '{"name": "Old Project", "status": "deleted"}'::jsonb,
  '192.168.1.1'::inet,
  'Mozilla/5.0...'
);

-- Get audit trail for tenant
SELECT
  al.id,
  al.action,
  al.resource_type,
  al.resource_id,
  al.changes,
  al.ip_address,
  al.created_at,
  up.full_name as user_name,
  up.email as user_email
FROM audit_logs al
LEFT JOIN user_profiles up ON up.id = al.user_id
WHERE al.tenant_id = 'tenant-uuid'
ORDER BY al.created_at DESC
LIMIT 100;

-- Get audit trail for specific user
SELECT
  al.action,
  al.resource_type,
  al.resource_id,
  al.changes,
  al.created_at
FROM audit_logs al
WHERE al.user_id = 'user-uuid'
  AND al.created_at >= NOW() - INTERVAL '30 days'
ORDER BY al.created_at DESC;

-- =====================================================
-- 12. PERMISSION CHECKS
-- =====================================================

-- Check if user has specific permission
SELECT user_has_permission('user-uuid', 'projects:create') as can_create_projects;

-- Get all permissions for a user
SELECT DISTINCT jsonb_array_elements_text(r.permissions) as permission
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 'user-uuid';

-- Check if user is admin
SELECT
  up.is_tenant_admin,
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = up.id
      AND r.name IN ('Tenant Owner', 'Tenant Admin')
  ) as has_admin_role
FROM user_profiles up
WHERE up.id = 'user-uuid';

-- =====================================================
-- 13. TENANT ISOLATION VERIFICATION
-- =====================================================

-- Verify that RLS is working (should return empty for different tenant)
-- This query should return 0 rows if RLS is properly enforced
SELECT COUNT(*) as potential_data_leak
FROM generation_history
WHERE tenant_id != (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
);

-- Test tenant isolation on projects
SELECT
  COUNT(*) as accessible_projects,
  COUNT(*) FILTER (WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())) as own_tenant_projects
FROM projects;

-- =====================================================
-- 14. MAINTENANCE QUERIES
-- =====================================================

-- Find large tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Clean up expired shares
UPDATE shared_content
SET is_active = false
WHERE expires_at < NOW()
  AND is_active = true;

-- Clean up expired invitations
UPDATE team_invitations
SET status = 'expired'
WHERE expires_at < NOW()
  AND status = 'pending';

-- Archive old audit logs (move to separate table or delete)
-- Be careful with this in production!
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- =====================================================
-- END OF SAMPLE QUERIES
-- =====================================================
