# Multi-Tenant Database Architecture

## Overview

This document describes the comprehensive multi-tenant database architecture for the AI Media Generation Platform (Higgsfield AI alternative). The system uses PostgreSQL with Supabase and implements Row-Level Security (RLS) for automatic tenant isolation.

## Architecture Strategy

### Multi-Tenancy Approach: Shared Database with RLS

**Why this approach?**
- **Cost-effective**: Single database reduces infrastructure costs
- **Scalable**: PostgreSQL handles thousands of tenants efficiently
- **Secure**: Automatic tenant isolation via Row-Level Security
- **Maintainable**: Schema updates apply to all tenants instantly
- **Performance**: Proper indexing on `tenant_id` ensures fast queries

### Database Engine: PostgreSQL (Supabase)

**Key Features Used:**
- Native Row-Level Security (RLS)
- JSONB for flexible metadata storage
- UUID primary keys
- Full-text search capabilities
- Trigger support for automation

## Database Schema

### Core Tables

#### 1. Tenants
Organizations/workspaces in the multi-tenant system.

```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan_type text NOT NULL,  -- free, pro, enterprise
  status text NOT NULL,      -- active, suspended, cancelled, trial
  settings jsonb,
  max_users int DEFAULT 5,
  max_storage_gb int DEFAULT 10,
  created_at timestamptz,
  updated_at timestamptz
);
```

**Indexes:**
- `idx_tenants_slug` - Fast slug lookups
- `idx_tenants_status` - Filter by status

#### 2. User Profiles
Extended user information linked to Supabase auth.

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL,        -- owner, admin, member, viewer
  is_tenant_admin boolean DEFAULT false,
  preferences jsonb,
  last_login_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(tenant_id, email)
);
```

**Indexes:**
- `idx_user_profiles_tenant_id` - Tenant membership
- `idx_user_profiles_email` - Email lookups

#### 3. Roles (RBAC)
Role-based access control system.

```sql
CREATE TABLE roles (
  id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  name text NOT NULL,
  description text,
  permissions jsonb,  -- Array of permission strings
  is_system_role boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(tenant_id, name)
);
```

**System Roles:**
1. **Super Admin** - Full system access
2. **Tenant Owner** - Full tenant access + billing
3. **Tenant Admin** - User & content management
4. **Content Creator** - Create/edit content
5. **Viewer** - Read-only access

**Permission Format:** `resource:action` (e.g., `projects:create`, `users:*`)

#### 4. User Roles
Junction table for user-role assignments.

```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  role_id uuid NOT NULL REFERENCES roles(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  granted_by uuid REFERENCES user_profiles(id),
  granted_at timestamptz,
  UNIQUE(user_id, role_id, tenant_id)
);
```

### Content Management Tables

#### 5. Projects
Workspaces for organizing related content.

```sql
CREATE TABLE projects (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  name text NOT NULL,
  description text,
  thumbnail_url text,
  status text NOT NULL,  -- active, archived, deleted
  settings jsonb,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz
);
```

#### 6. Generation History
Enhanced tracking of AI media generations.

```sql
CREATE TABLE generation_history (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  project_id uuid REFERENCES projects(id),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  studio_type text NOT NULL,    -- image, video, cinema, effects, etc.
  generation_type text NOT NULL, -- image, video, audio, text
  model_name text NOT NULL,
  prompt text NOT NULL,
  negative_prompt text,
  parameters jsonb,
  input_assets jsonb,
  output_url text,
  thumbnail_url text,
  status text NOT NULL,         -- pending, processing, completed, failed
  error_message text,
  processing_time_ms int,
  cost_credits numeric(10,4),
  is_public boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz,
  completed_at timestamptz
);
```

**Indexes:**
- `idx_generation_history_tenant_id` - Tenant isolation
- `idx_generation_history_user_id` - User's generations
- `idx_generation_history_status` - Filter by status
- `idx_generation_history_created_at` - Time-based queries
- `idx_generation_history_is_public` - Public gallery

#### 7. Generation Versions
Track iterations and variations.

```sql
CREATE TABLE generation_versions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  generation_history_id uuid NOT NULL REFERENCES generation_history(id),
  version_number int NOT NULL,
  output_url text NOT NULL,
  parameters jsonb,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz,
  UNIQUE(generation_history_id, version_number)
);
```

#### 8. Assets
User-uploaded and generated media files.

```sql
CREATE TABLE assets (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  project_id uuid REFERENCES projects(id),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  asset_type text NOT NULL,  -- image, video, audio, 3d, document
  thumbnail_url text,
  metadata jsonb,
  tags text[],
  is_public boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Usage & Billing Tables

#### 9. Usage Logs
Resource consumption tracking for billing.

```sql
CREATE TABLE usage_logs (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  resource_type text NOT NULL,  -- generation, storage, api_call, upscale
  resource_id uuid,
  studio_type text,
  credits_consumed numeric(10,4),
  quantity numeric(15,4),
  unit text,
  metadata jsonb,
  created_at timestamptz
);
```

**Indexes:**
- `idx_usage_logs_tenant_created` - Analytics queries
- `idx_usage_logs_resource_type` - Resource breakdown

#### 10. Credit Balances
Current credit balance per tenant.

```sql
CREATE TABLE credit_balances (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id),
  credits_available numeric(15,4) NOT NULL CHECK (credits_available >= 0),
  credits_consumed numeric(15,4) NOT NULL CHECK (credits_consumed >= 0),
  credits_purchased numeric(15,4) NOT NULL CHECK (credits_purchased >= 0),
  last_recharged_at timestamptz,
  updated_at timestamptz
);
```

#### 11. Credit Transactions
History of credit purchases and adjustments.

```sql
CREATE TABLE credit_transactions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  transaction_type text NOT NULL,  -- purchase, grant, refund, adjustment, bonus
  amount numeric(15,4) NOT NULL,
  balance_before numeric(15,4),
  balance_after numeric(15,4),
  description text NOT NULL,
  payment_method text,
  payment_reference text,
  processed_by uuid REFERENCES user_profiles(id),
  metadata jsonb,
  created_at timestamptz
);
```

#### 12. Subscriptions
Subscription plans and billing cycles.

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  plan_type text NOT NULL,
  status text NOT NULL,
  billing_interval text NOT NULL,  -- monthly, yearly, one_time
  price_amount numeric(10,2),
  currency text DEFAULT 'USD',
  credits_per_month int,
  started_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  trial_ends_at timestamptz,
  payment_provider text,
  payment_provider_id text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
);
```

### Collaboration & Sharing Tables

#### 13. Shared Content
Enable sharing with external users.

```sql
CREATE TABLE shared_content (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  shared_by uuid NOT NULL REFERENCES user_profiles(id),
  content_type text NOT NULL,  -- project, generation, asset
  content_id uuid NOT NULL,
  share_token text UNIQUE NOT NULL,
  share_type text NOT NULL,    -- public, private, password_protected
  shared_with_email text,
  permissions text[],
  password_hash text,
  expires_at timestamptz,
  view_count int DEFAULT 0,
  last_accessed_at timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz
);
```

#### 14. Comments
Collaboration comments on content.

```sql
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  parent_comment_id uuid REFERENCES comments(id),
  content text NOT NULL,
  mentions uuid[],
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz,
  updated_at timestamptz
);
```

#### 15. Notifications
Real-time user notifications.

```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  related_user_id uuid REFERENCES user_profiles(id),
  metadata jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz
);
```

**Indexes:**
- `idx_notifications_user_unread` - Unread notifications query

#### 16. Team Invitations
Manage tenant member invitations.

```sql
CREATE TABLE team_invitations (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES user_profiles(id),
  role text NOT NULL,
  invitation_token text UNIQUE NOT NULL,
  status text NOT NULL,  -- pending, accepted, declined, expired
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz
);
```

### Configuration Tables

#### 17. Tenant Settings
Tenant-specific configuration.

```sql
CREATE TABLE tenant_settings (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id),
  branding jsonb,              -- Logo, colors, custom domain
  features_enabled jsonb,      -- Feature flags
  default_permissions jsonb,   -- Default access settings
  integrations jsonb,          -- Third-party configs
  notification_settings jsonb, -- Notification preferences
  security_settings jsonb,     -- Security policies
  updated_at timestamptz
);
```

#### 18. Model Configurations
Custom AI model settings per tenant.

```sql
CREATE TABLE model_configurations (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  model_name text NOT NULL,
  studio_type text NOT NULL,
  default_parameters jsonb,
  is_enabled boolean DEFAULT true,
  custom_endpoint text,
  created_at timestamptz,
  updated_at timestamptz,
  UNIQUE(tenant_id, model_name, studio_type)
);
```

#### 19. Audit Logs
Security and compliance audit trail.

```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  tenant_id uuid REFERENCES tenants(id),
  user_id uuid REFERENCES user_profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz
);
```

#### 20. API Keys
Programmatic access tokens.

```sql
CREATE TABLE api_keys (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  scopes text[],
  rate_limit_per_hour int DEFAULT 1000,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz
);
```

## Row-Level Security (RLS)

All tables have RLS enabled with policies enforcing tenant isolation. Example policy pattern:

```sql
-- Users can only view data in their tenant
CREATE POLICY "Users can view resources in their tenant"
  ON table_name FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Users can only insert data to their tenant
CREATE POLICY "Users can create resources in their tenant"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );
```

## Helper Functions

### 1. Initialize Tenant
Sets up new tenant with defaults and welcome credits.

```sql
SELECT initialize_tenant('tenant-uuid-here');
```

### 2. Log Credit Usage
Handles credit consumption with balance checks.

```sql
SELECT log_credit_usage(
  'tenant-uuid',
  'user-uuid',
  'generation',
  'resource-uuid',
  5.0,  -- credits
  '{"model": "flux-pro", "resolution": "1024x1024"}'::jsonb
);
```

### 3. Create Notification
Sends notification to user.

```sql
SELECT create_notification(
  'user-uuid',
  'generation_complete',
  'Generation Complete',
  'Your video is ready to view',
  '/projects/abc/generations/xyz'
);
```

### 4. Check Permission
Verify user has permission.

```sql
SELECT user_has_permission('user-uuid', 'projects:create');
```

## Sample Queries

### Query 1: Get User's Tenant Info
```sql
SELECT
  t.id,
  t.name,
  t.plan_type,
  t.status,
  cb.credits_available,
  up.role,
  up.is_tenant_admin
FROM tenants t
JOIN user_profiles up ON up.tenant_id = t.id
LEFT JOIN credit_balances cb ON cb.tenant_id = t.id
WHERE up.id = auth.uid();
```

### Query 2: Get User's Projects with Generation Count
```sql
SELECT
  p.id,
  p.name,
  p.description,
  p.thumbnail_url,
  p.created_at,
  COUNT(gh.id) as generation_count
FROM projects p
LEFT JOIN generation_history gh ON gh.project_id = p.id
WHERE p.tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
AND p.status = 'active'
GROUP BY p.id
ORDER BY p.updated_at DESC;
```

### Query 3: Get Recent Generations with User Info
```sql
SELECT
  gh.id,
  gh.prompt,
  gh.model_name,
  gh.studio_type,
  gh.output_url,
  gh.thumbnail_url,
  gh.status,
  gh.cost_credits,
  gh.created_at,
  up.full_name as creator_name,
  up.avatar_url as creator_avatar,
  p.name as project_name
FROM generation_history gh
JOIN user_profiles up ON up.id = gh.user_id
LEFT JOIN projects p ON p.id = gh.project_id
WHERE gh.tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
ORDER BY gh.created_at DESC
LIMIT 50;
```

### Query 4: Get Usage Analytics for Tenant
```sql
SELECT
  DATE_TRUNC('day', created_at) as date,
  resource_type,
  COUNT(*) as usage_count,
  SUM(credits_consumed) as total_credits,
  SUM(quantity) as total_quantity
FROM usage_logs
WHERE tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), resource_type
ORDER BY date DESC, resource_type;
```

### Query 5: Get Unread Notifications
```sql
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
WHERE n.user_id = auth.uid()
AND n.is_read = false
ORDER BY n.created_at DESC;
```

### Query 6: Get Team Members with Roles
```sql
SELECT
  up.id,
  up.email,
  up.full_name,
  up.avatar_url,
  up.role as base_role,
  up.is_tenant_admin,
  up.last_login_at,
  ARRAY_AGG(r.name) as assigned_roles
FROM user_profiles up
LEFT JOIN user_roles ur ON ur.user_id = up.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE up.tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
GROUP BY up.id
ORDER BY up.created_at;
```

### Query 7: Get Shared Content with Stats
```sql
SELECT
  sc.id,
  sc.content_type,
  sc.share_token,
  sc.share_type,
  sc.view_count,
  sc.expires_at,
  sc.created_at,
  up.full_name as shared_by_name,
  CASE
    WHEN sc.content_type = 'project' THEN (SELECT name FROM projects WHERE id = sc.content_id)
    WHEN sc.content_type = 'generation' THEN (SELECT prompt FROM generation_history WHERE id = sc.content_id)
  END as content_name
FROM shared_content sc
JOIN user_profiles up ON up.id = sc.shared_by
WHERE sc.tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
AND sc.is_active = true
ORDER BY sc.created_at DESC;
```

### Query 8: Calculate Storage Usage by Asset Type
```sql
SELECT
  asset_type,
  COUNT(*) as file_count,
  SUM(file_size_bytes) as total_bytes,
  ROUND(SUM(file_size_bytes) / 1024.0 / 1024.0 / 1024.0, 2) as total_gb
FROM assets
WHERE tenant_id IN (
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
)
GROUP BY asset_type
ORDER BY total_bytes DESC;
```

## Security Considerations

### 1. Tenant Isolation
- Every table includes `tenant_id` column
- RLS policies enforce automatic filtering
- No cross-tenant data access possible

### 2. Authentication
- All policies check `auth.uid()`
- Integration with Supabase Auth
- JWT-based authentication

### 3. Authorization
- Role-based access control (RBAC)
- Permission checks in application layer
- Helper function: `user_has_permission()`

### 4. Data Protection
- Password hashes (never plain text)
- API key hashes (never plain text)
- Share tokens are cryptographically secure
- Audit logging for compliance

### 5. Rate Limiting
- API key rate limits enforced
- Credit system prevents abuse
- Subscription tier limits

## Performance Optimization

### Indexing Strategy
1. **Tenant ID indexes** - Every multi-tenant table
2. **Foreign key indexes** - All foreign keys
3. **Status/type indexes** - Common filter fields
4. **Composite indexes** - Frequent query patterns
5. **Partial indexes** - Active/public records
6. **GIN indexes** - JSONB and array columns

### Query Optimization
1. Use tenant_id in WHERE clauses
2. Leverage covering indexes
3. Avoid SELECT * queries
4. Use EXPLAIN ANALYZE for optimization
5. Implement pagination with cursors

### Scaling Considerations
1. Connection pooling (PgBouncer)
2. Read replicas for analytics
3. Partition large tables by date
4. Archive old audit logs
5. Implement caching layer (Redis)

## Migration Strategy

### Adding New Columns
```sql
ALTER TABLE table_name
ADD COLUMN new_column_type data_type DEFAULT default_value;
```

### Adding New Tables
Always include:
- `tenant_id` for multi-tenant tables
- Appropriate indexes
- RLS policies
- Foreign key constraints

### Modifying Existing Data
Use transactions and test on staging:
```sql
BEGIN;
-- Your changes here
-- Test queries
ROLLBACK; -- or COMMIT if satisfied
```

## Backup & Recovery

### Automated Backups
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Test restore procedures regularly

### Manual Backups
```bash
# Backup specific tenant data
pg_dump -h host -U user -d database \
  --table=table_name \
  --where="tenant_id='uuid'" \
  > tenant_backup.sql
```

## Monitoring & Maintenance

### Key Metrics to Monitor
1. Database size and growth rate
2. Query performance (slow query log)
3. Connection pool usage
4. RLS policy performance
5. Index usage statistics
6. Table bloat

### Regular Maintenance
1. VACUUM ANALYZE on large tables
2. Update table statistics
3. Review and optimize slow queries
4. Archive old audit logs
5. Monitor credit balance accuracy

## Conclusion

This multi-tenant architecture provides:
- **Strong tenant isolation** via RLS
- **Comprehensive feature set** for SaaS platform
- **Scalability** for thousands of tenants
- **Security** with audit trails and RBAC
- **Flexibility** with JSONB metadata
- **Performance** through strategic indexing

The schema supports the complete AI media generation platform including user management, content creation, billing, collaboration, and analytics.
