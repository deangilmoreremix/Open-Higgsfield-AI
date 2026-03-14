# Database Setup Guide

## Quick Start

The database schema has been automatically applied to your Supabase instance. All tables, indexes, and Row-Level Security policies are now active.

## What's Been Created

### 20 Tables in 5 Categories

#### 1. Core Tables (4)
- `tenants` - Organizations/workspaces
- `user_profiles` - Extended user information
- `roles` - RBAC role definitions
- `user_roles` - User-role assignments

#### 2. Content Management (4)
- `projects` - Content organization workspaces
- `generation_history` - AI generation tracking
- `generation_versions` - Generation iterations
- `assets` - File storage metadata

#### 3. Usage & Billing (4)
- `usage_logs` - Resource consumption tracking
- `credit_balances` - Current credit balance
- `credit_transactions` - Credit history
- `subscriptions` - Subscription management

#### 4. Collaboration (4)
- `shared_content` - External sharing
- `comments` - Content collaboration
- `notifications` - User notifications
- `team_invitations` - Member invitations

#### 5. Configuration (4)
- `tenant_settings` - Tenant preferences
- `model_configurations` - AI model settings
- `audit_logs` - Security audit trail
- `api_keys` - API access tokens

### 5 System Roles Created

1. **Super Admin** - Full system access
2. **Tenant Owner** - Full tenant access + billing
3. **Tenant Admin** - User & content management
4. **Content Creator** - Create/edit content
5. **Viewer** - Read-only access

### Helper Functions

- `initialize_tenant(tenant_id)` - Setup new tenant
- `log_credit_usage(...)` - Track credit consumption
- `create_notification(...)` - Send notifications
- `user_has_permission(...)` - Check permissions

## Entity Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                     MULTI-TENANT SCHEMA                         │
└────────────────────────────────────────────────────────────────┘

                           ┌──────────┐
                           │ TENANTS  │
                           └────┬─────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
            ┌────▼─────┐   ┌───▼────┐    ┌───▼────────┐
            │  USERS   │   │ ROLES  │    │  SETTINGS  │
            │ PROFILES │   └───┬────┘    │            │
            └────┬─────┘       │         └────────────┘
                 │      ┌──────▼──────┐
                 │      │ USER_ROLES  │
                 │      └─────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
   ┌────▼────┐ ┌▼──────────┐ ┌─────────────┐
   │PROJECTS │ │GENERATIONS│ │   ASSETS    │
   └────┬────┘ └─────┬─────┘ └─────────────┘
        │            │
        │      ┌─────▼──────────┐
        │      │    VERSIONS    │
        │      └────────────────┘
        │
   ┌────▼────────┐
   │  COMMENTS   │
   └─────────────┘

   ┌──────────────────┐     ┌───────────────┐
   │ CREDIT_BALANCES  │────▶│ TRANSACTIONS  │
   └──────────────────┘     └───────────────┘

   ┌──────────────────┐     ┌───────────────┐
   │ SHARED_CONTENT   │     │ NOTIFICATIONS │
   └──────────────────┘     └───────────────┘

   ┌──────────────────┐     ┌───────────────┐
   │  SUBSCRIPTIONS   │     │  USAGE_LOGS   │
   └──────────────────┘     └───────────────┘
```

## Key Relationships

### Tenant-centric (One-to-Many)
```
tenants
  ├─► user_profiles (tenant members)
  ├─► projects (tenant projects)
  ├─► generation_history (tenant generations)
  ├─► assets (tenant files)
  ├─► credit_balances (1:1)
  ├─► subscriptions (tenant subscription)
  └─► tenant_settings (1:1)
```

### User-centric (One-to-Many)
```
user_profiles
  ├─► projects (created by user)
  ├─► generation_history (user's generations)
  ├─► assets (user's uploads)
  ├─► comments (user's comments)
  ├─► notifications (user's notifications)
  └─► user_roles (user's role assignments)
```

### Project-centric (One-to-Many)
```
projects
  ├─► generation_history (project generations)
  ├─► assets (project files)
  └─► comments (project comments)
```

### Generation-centric (One-to-Many)
```
generation_history
  ├─► generation_versions (iterations)
  ├─► comments (generation feedback)
  └─► shared_content (shared generations)
```

## Testing Your Database

### 1. Verify Tables Were Created

Run this query in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'tenants', 'user_profiles', 'roles', 'projects',
    'generation_history', 'assets', 'credit_balances',
    'subscriptions', 'notifications', 'audit_logs'
  )
ORDER BY table_name;
```

Expected: 20 rows returned.

### 2. Verify RLS is Enabled

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%'
ORDER BY tablename;
```

Expected: All tables should have `rls_enabled = true`.

### 3. Check System Roles

```sql
SELECT id, name, description, is_system_role
FROM roles
WHERE is_system_role = true
ORDER BY name;
```

Expected: 5 system roles.

### 4. Verify Indexes

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Expected: 50+ indexes.

## Integration with Your Application

### 1. Initialize Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

### 2. User Signup Flow

When a user signs up, you'll need to create their tenant and profile:

```javascript
async function handleUserSignup(email, password, fullName) {
  // 1. Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (authError) throw authError;

  // 2. Create tenant
  const tenantSlug = email.split('@')[0] + '-' + Date.now();
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
      name: `${fullName}'s Workspace`,
      slug: tenantSlug,
      plan_type: 'free',
      status: 'active'
    })
    .select()
    .single();

  if (tenantError) throw tenantError;

  // 3. Create user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      tenant_id: tenant.id,
      email: email,
      full_name: fullName,
      role: 'owner',
      is_tenant_admin: true
    });

  if (profileError) throw profileError;

  // 4. Assign Tenant Owner role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role_id: '00000000-0000-0000-0000-000000000002', // Tenant Owner
      tenant_id: tenant.id
    });

  if (roleError) throw roleError;

  // 5. Initialize tenant (credits, settings)
  const { error: initError } = await supabase.rpc('initialize_tenant', {
    tenant_id_param: tenant.id
  });

  if (initError) throw initError;

  return { user: authData.user, tenant };
}
```

### 3. Get Current User's Tenant

```javascript
async function getCurrentUserTenant() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      tenant:tenants (
        id,
        name,
        slug,
        plan_type,
        status
      ),
      credit_balance:credit_balances!inner (
        credits_available,
        credits_consumed
      )
    `)
    .eq('id', user.id)
    .single();

  return data;
}
```

### 4. Create a Generation

```javascript
async function createGeneration(projectId, prompt, model, parameters) {
  const { data: { user } } = await supabase.auth.getUser();
  const userProfile = await getCurrentUserTenant();

  const { data, error } = await supabase
    .from('generation_history')
    .insert({
      tenant_id: userProfile.tenant.id,
      project_id: projectId,
      user_id: user.id,
      studio_type: 'image',
      generation_type: 'image',
      model_name: model,
      prompt: prompt,
      parameters: parameters,
      cost_credits: 2.5,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;

  // Log credit usage
  await supabase.rpc('log_credit_usage', {
    tenant_id_param: userProfile.tenant.id,
    user_id_param: user.id,
    resource_type_param: 'generation',
    resource_id_param: data.id,
    credits_amount: 2.5,
    metadata_param: { model, ...parameters }
  });

  return data;
}
```

### 5. Get User's Projects

```javascript
async function getUserProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      creator:user_profiles!projects_created_by_fkey (
        full_name,
        avatar_url
      ),
      generation_count:generation_history(count)
    `)
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  return data;
}
```

### 6. Check User Permission

```javascript
async function checkPermission(permission) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .rpc('user_has_permission', {
      user_id_param: user.id,
      permission_param: permission
    });

  return data === true;
}
```

## Common Operations

### Add a Team Member

```javascript
async function inviteTeamMember(email, role) {
  const userProfile = await getCurrentUserTenant();

  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      tenant_id: userProfile.tenant.id,
      invited_email: email,
      invited_by: userProfile.id,
      role: role,
      invitation_token: token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
    .select()
    .single();

  // Send invitation email with link containing token
  // await sendInvitationEmail(email, token);

  return data;
}
```

### Get Credit Balance

```javascript
async function getCreditBalance() {
  const userProfile = await getCurrentUserTenant();

  const { data, error } = await supabase
    .from('credit_balances')
    .select('*')
    .eq('tenant_id', userProfile.tenant.id)
    .single();

  return data;
}
```

### Create Notification

```javascript
async function notifyUser(userId, type, title, message, actionUrl = null) {
  const { data, error } = await supabase
    .rpc('create_notification', {
      user_id_param: userId,
      notification_type_param: type,
      title_param: title,
      message_param: message,
      action_url_param: actionUrl
    });

  return data;
}
```

### Share Content

```javascript
async function shareGeneration(generationId, shareType = 'public') {
  const userProfile = await getCurrentUserTenant();
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('shared_content')
    .insert({
      tenant_id: userProfile.tenant.id,
      shared_by: userProfile.id,
      content_type: 'generation',
      content_id: generationId,
      share_token: token,
      share_type: shareType,
      permissions: ['view', 'download'],
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    .select()
    .single();

  return {
    ...data,
    share_url: `${window.location.origin}/shared/${token}`
  };
}
```

## Security Best Practices

### 1. Always Use RLS Policies
- Never disable RLS on tables
- Test policies thoroughly before deployment
- RLS provides automatic tenant isolation

### 2. Validate on Server Side
- Check permissions in backend/edge functions
- Don't trust client-side permission checks
- Use `user_has_permission()` function

### 3. Audit Important Actions
```javascript
async function logAuditEvent(action, resourceType, resourceId, changes) {
  const { data: { user } } = await supabase.auth.getUser();
  const userProfile = await getCurrentUserTenant();

  await supabase.from('audit_logs').insert({
    tenant_id: userProfile.tenant.id,
    user_id: user.id,
    action: action,
    resource_type: resourceType,
    resource_id: resourceId,
    changes: changes,
    ip_address: '0.0.0.0', // Get from request
    user_agent: navigator.userAgent
  });
}
```

### 4. Secure API Keys
- Always hash API keys before storage
- Never log or display full keys
- Use key prefixes for identification

### 5. Rate Limiting
- Implement rate limiting on API endpoints
- Track usage via `usage_logs` table
- Enforce credit limits

## Performance Tips

### 1. Use Indexes Wisely
All critical indexes are already created, including:
- Foreign key indexes
- Tenant ID indexes
- Status/type filters
- Date-based queries

### 2. Optimize Queries
```javascript
// Good: Select only needed columns
const { data } = await supabase
  .from('generation_history')
  .select('id, prompt, output_url, created_at')
  .limit(50);

// Bad: Select everything
const { data } = await supabase
  .from('generation_history')
  .select('*');
```

### 3. Use Pagination
```javascript
const { data, error } = await supabase
  .from('generation_history')
  .select('*')
  .range(0, 49) // First 50 items
  .order('created_at', { ascending: false });
```

### 4. Cache Frequently Accessed Data
- Cache tenant settings
- Cache user permissions
- Cache credit balances (with TTL)

## Monitoring & Maintenance

### Check Database Size
```sql
SELECT
  pg_size_pretty(pg_database_size(current_database())) as total_size;
```

### Monitor Table Growth
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup as rows
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Find Slow Queries
Enable slow query logging in Supabase dashboard and review regularly.

### Regular Tasks
1. Clean up expired shares monthly
2. Archive old audit logs yearly
3. Vacuum analyze large tables weekly
4. Review and optimize slow queries monthly

## Troubleshooting

### Issue: User Can't See Their Data
**Cause**: RLS policy issue or missing tenant association

**Solution**:
```sql
-- Check user's tenant association
SELECT up.*, t.name as tenant_name
FROM user_profiles up
JOIN tenants t ON t.id = up.tenant_id
WHERE up.id = 'user-uuid';

-- Verify RLS policies are active
SELECT * FROM pg_policies WHERE tablename = 'projects';
```

### Issue: Insufficient Credits Error
**Cause**: Credit balance too low

**Solution**:
```sql
-- Check balance
SELECT * FROM credit_balances WHERE tenant_id = 'tenant-uuid';

-- Add credits
UPDATE credit_balances
SET credits_available = credits_available + 100
WHERE tenant_id = 'tenant-uuid';
```

### Issue: Permission Denied
**Cause**: Missing role assignment

**Solution**:
```sql
-- Check user roles
SELECT ur.*, r.name as role_name
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 'user-uuid';

-- Assign role
INSERT INTO user_roles (user_id, role_id, tenant_id)
VALUES ('user-uuid', 'role-uuid', 'tenant-uuid');
```

## Next Steps

1. **Review the Schema**: Read `DATABASE_ARCHITECTURE.md`
2. **Study Examples**: Check `DATABASE_SAMPLE_QUERIES.sql`
3. **Test Queries**: Run sample queries in Supabase SQL Editor
4. **Integrate**: Add database calls to your application
5. **Monitor**: Set up monitoring and alerts

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance](https://supabase.com/docs/guides/database/performance)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review RLS policies in Supabase dashboard
3. Check Supabase logs for errors
4. Verify environment variables are set correctly

---

**Database Version**: 1.0
**Last Updated**: 2026-03-14
**Compatible With**: PostgreSQL 15+, Supabase
