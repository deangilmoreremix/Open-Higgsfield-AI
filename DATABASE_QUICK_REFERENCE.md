# Database Quick Reference Card

## 🎯 Essential Information

### Database Type
**PostgreSQL 15+** via **Supabase**

### Multi-Tenancy Strategy
**Shared Database** with **Row-Level Security (RLS)**

### Authentication
**Supabase Auth** integrated with `user_profiles` table

---

## 📊 20 Tables Overview

| Category | Tables | Purpose |
|----------|--------|---------|
| **Core** | tenants, user_profiles, roles, user_roles | Multi-tenant foundation |
| **Content** | projects, generation_history, generation_versions, assets | AI content management |
| **Billing** | usage_logs, credit_balances, credit_transactions, subscriptions | Usage tracking |
| **Collaboration** | shared_content, comments, notifications, team_invitations | Team features |
| **Config** | tenant_settings, model_configurations, audit_logs, api_keys | System config |

---

## 🔑 Key Tables at a Glance

### tenants
Organization/workspace for multi-tenancy
```sql
id, name, slug, plan_type, status, max_users, max_storage_gb
```

### user_profiles
Extended user info linked to auth.users
```sql
id, tenant_id, email, full_name, role, is_tenant_admin
```

### projects
Organize content into workspaces
```sql
id, tenant_id, created_by, name, description, status, tags[]
```

### generation_history
Track all AI generations
```sql
id, tenant_id, project_id, user_id, studio_type, model_name,
prompt, output_url, status, cost_credits, is_public
```

### credit_balances
Current credit balance per tenant
```sql
tenant_id, credits_available, credits_consumed, credits_purchased
```

---

## 🔐 5 System Roles

| Role | ID | Permissions |
|------|----|----|
| **Super Admin** | 00000000-0000-0000-0000-000000000001 | Full system access |
| **Tenant Owner** | 00000000-0000-0000-0000-000000000002 | Full tenant + billing |
| **Tenant Admin** | 00000000-0000-0000-0000-000000000003 | User & content mgmt |
| **Content Creator** | 00000000-0000-0000-0000-000000000004 | Create/edit content |
| **Viewer** | 00000000-0000-0000-0000-000000000005 | Read-only |

---

## 🛠️ Helper Functions

### 1. Initialize Tenant
```sql
SELECT initialize_tenant('tenant-uuid');
```
Sets up: credit balance, tenant settings, welcome bonus

### 2. Log Credit Usage
```sql
SELECT log_credit_usage(
  'tenant-uuid',
  'user-uuid',
  'generation',
  'resource-uuid',
  2.5,
  '{"model": "flux-pro"}'::jsonb
);
```
Deducts credits and logs usage

### 3. Create Notification
```sql
SELECT create_notification(
  'user-uuid',
  'generation_complete',
  'Your video is ready!',
  'Generation completed successfully',
  '/projects/abc/generations/xyz'
);
```
Sends notification to user

### 4. Check Permission
```sql
SELECT user_has_permission('user-uuid', 'projects:create');
```
Returns true/false

---

## 💻 Common JavaScript Queries

### Get Current User's Tenant
```javascript
const { data } = await supabase
  .from('user_profiles')
  .select(`
    *,
    tenant:tenants(*),
    credit_balance:credit_balances(*)
  `)
  .eq('id', user.id)
  .single();
```

### List User's Projects
```javascript
const { data } = await supabase
  .from('projects')
  .select(`
    *,
    creator:user_profiles(full_name, avatar_url),
    generations:generation_history(count)
  `)
  .eq('status', 'active')
  .order('updated_at', { ascending: false });
```

### Create Generation
```javascript
const { data } = await supabase
  .from('generation_history')
  .insert({
    tenant_id: tenant.id,
    project_id: projectId,
    user_id: user.id,
    studio_type: 'image',
    generation_type: 'image',
    model_name: 'flux-pro',
    prompt: prompt,
    parameters: { width: 1024, height: 1024 },
    cost_credits: 2.5,
    status: 'pending'
  })
  .select()
  .single();
```

### Get Recent Generations
```javascript
const { data } = await supabase
  .from('generation_history')
  .select(`
    *,
    project:projects(name),
    user:user_profiles(full_name, avatar_url)
  `)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Check Credit Balance
```javascript
const { data } = await supabase
  .from('credit_balances')
  .select('credits_available, credits_consumed')
  .eq('tenant_id', tenant.id)
  .single();
```

### Share Content
```javascript
const token = crypto.randomUUID();
const { data } = await supabase
  .from('shared_content')
  .insert({
    tenant_id: tenant.id,
    shared_by: user.id,
    content_type: 'generation',
    content_id: generationId,
    share_token: token,
    share_type: 'public',
    permissions: ['view', 'download']
  })
  .select()
  .single();

const shareUrl = `${window.location.origin}/shared/${token}`;
```

### Get Unread Notifications
```javascript
const { data } = await supabase
  .from('notifications')
  .select(`
    *,
    related_user:user_profiles(full_name, avatar_url)
  `)
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

---

## 🔒 Security Checklist

- ✅ All tables have RLS enabled
- ✅ Tenant isolation via policies
- ✅ Auth integration with `auth.uid()`
- ✅ Password hashing (never plain text)
- ✅ API key hashing (never plain text)
- ✅ Audit logging enabled
- ✅ Secure share tokens

---

## 📈 Performance Tips

### Always Include in Queries
- `tenant_id` in WHERE clauses
- `LIMIT` for list queries
- Specific columns in SELECT (not *)
- Proper ORDER BY with indexes

### Use Indexes
- `idx_{table}_tenant_id` - Every multi-tenant table
- `idx_{table}_created_at` - Time-based queries
- `idx_{table}_status` - Status filtering
- `idx_notifications_user_unread` - Unread notifications

### Pagination Pattern
```javascript
const { data } = await supabase
  .from('generation_history')
  .select('*')
  .range(0, 49)  // First 50 items
  .order('created_at', { ascending: false });
```

---

## 🐛 Troubleshooting

### User Can't See Data
```sql
-- Check tenant association
SELECT * FROM user_profiles WHERE id = 'user-uuid';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'projects';
```

### Insufficient Credits
```sql
-- Check balance
SELECT * FROM credit_balances WHERE tenant_id = 'tenant-uuid';

-- Add credits
UPDATE credit_balances
SET credits_available = credits_available + 100
WHERE tenant_id = 'tenant-uuid';
```

### Permission Denied
```sql
-- Check roles
SELECT ur.*, r.name
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE ur.user_id = 'user-uuid';
```

---

## 📊 Useful Analytics Queries

### Dashboard Stats
```sql
SELECT
  (SELECT COUNT(*) FROM user_profiles WHERE tenant_id = $1) as users,
  (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as projects,
  (SELECT COUNT(*) FROM generation_history WHERE tenant_id = $1) as generations,
  (SELECT credits_available FROM credit_balances WHERE tenant_id = $1) as credits;
```

### Usage by Studio Type
```sql
SELECT
  studio_type,
  COUNT(*) as count,
  SUM(cost_credits) as total_credits
FROM generation_history
WHERE tenant_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY studio_type
ORDER BY count DESC;
```

### Monthly Activity
```sql
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as generations,
  COUNT(DISTINCT user_id) as active_users
FROM generation_history
WHERE tenant_id = $1
GROUP BY month
ORDER BY month DESC;
```

---

## 📁 Documentation Files

| File | Purpose |
|------|---------|
| `DATABASE_ARCHITECTURE.md` | Complete schema reference |
| `DATABASE_SAMPLE_QUERIES.sql` | 500+ lines of query examples |
| `DATABASE_SETUP_GUIDE.md` | Integration guide |
| `DATABASE_SCHEMA_DIAGRAM.md` | Visual diagrams |
| `DATABASE_IMPLEMENTATION_SUMMARY.md` | Project summary |
| `DATABASE_QUICK_REFERENCE.md` | This file |

---

## 🚀 Getting Started Checklist

- [ ] Read `DATABASE_ARCHITECTURE.md`
- [ ] Test sample queries in Supabase SQL Editor
- [ ] Verify RLS is working
- [ ] Test helper functions
- [ ] Implement user signup flow
- [ ] Add generation tracking
- [ ] Integrate credit system
- [ ] Test permissions

---

## 📞 Quick Links

- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
- **SQL Editor**: Dashboard → SQL Editor
- **Table Editor**: Dashboard → Table Editor
- **Auth Users**: Dashboard → Authentication

---

## 💡 Common Patterns

### Create with Audit Log
```javascript
// 1. Create resource
const { data } = await supabase.from('projects').insert({...}).select().single();

// 2. Log audit event
await supabase.from('audit_logs').insert({
  tenant_id: tenant.id,
  user_id: user.id,
  action: 'project_created',
  resource_type: 'project',
  resource_id: data.id,
  changes: { name: data.name }
});
```

### Deduct Credits
```javascript
// Use helper function
await supabase.rpc('log_credit_usage', {
  tenant_id_param: tenant.id,
  user_id_param: user.id,
  resource_type_param: 'generation',
  resource_id_param: generation.id,
  credits_amount: 2.5
});
```

### Check Before Create
```javascript
// Check credits first
const { data: balance } = await supabase
  .from('credit_balances')
  .select('credits_available')
  .eq('tenant_id', tenant.id)
  .single();

if (balance.credits_available < costCredits) {
  throw new Error('Insufficient credits');
}

// Then create
await createGeneration();
```

---

**Version**: 1.0
**Last Updated**: 2026-03-14
**Status**: Production Ready

---

**Quick Tip**: Keep this file handy for daily development reference!
