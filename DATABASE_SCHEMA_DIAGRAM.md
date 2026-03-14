# Database Schema Visual Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MULTI-TENANT DATABASE                              │
│                      AI Media Generation Platform                            │
└─────────────────────────────────────────────────────────────────────────────┘

                                ┌──────────────┐
                                │   TENANTS    │
                                │──────────────│
                                │ id (PK)      │
                                │ name         │
                                │ slug (UQ)    │
                                │ plan_type    │
                                │ status       │
                                │ settings     │
                                └──────┬───────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
           ┌────────▼────────┐  ┌─────▼──────┐  ┌───────▼────────┐
           │ USER_PROFILES   │  │   ROLES    │  │ TENANT_SETTINGS│
           │─────────────────│  │────────────│  │────────────────│
           │ id (PK,FK)      │  │ id (PK)    │  │ tenant_id (PK) │
           │ tenant_id (FK)  │  │ tenant_id  │  │ branding       │
           │ email           │  │ name       │  │ features       │
           │ full_name       │  │ permissions│  │ integrations   │
           │ role            │  │ is_system  │  └────────────────┘
           │ is_tenant_admin │  └─────┬──────┘
           └────────┬────────┘        │
                    │                 │
                    │         ┌───────▼──────┐
                    └────────►│ USER_ROLES   │
                              │──────────────│
                              │ id (PK)      │
                              │ user_id (FK) │
                              │ role_id (FK) │
                              │ tenant_id    │
                              └──────────────┘

                    ┌─────────────────┐
                    │ USER_PROFILES   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼───────┐  ┌────────▼────────┐
│   PROJECTS     │  │ GENERATION_    │  │    ASSETS       │
│────────────────│  │   HISTORY      │  │─────────────────│
│ id (PK)        │  │────────────────│  │ id (PK)         │
│ tenant_id (FK) │  │ id (PK)        │  │ tenant_id (FK)  │
│ created_by (FK)│  │ tenant_id (FK) │  │ project_id (FK) │
│ name           │  │ project_id (FK)│  │ user_id (FK)    │
│ description    │  │ user_id (FK)   │  │ file_name       │
│ status         │  │ studio_type    │  │ file_path       │
│ tags[]         │  │ model_name     │  │ file_size_bytes │
└───────┬────────┘  │ prompt         │  │ mime_type       │
        │           │ output_url     │  │ asset_type      │
        │           │ status         │  │ tags[]          │
        │           │ cost_credits   │  └─────────────────┘
        │           │ is_public      │
        │           └────────┬───────┘
        │                    │
        │           ┌────────▼──────────┐
        │           │ GENERATION_       │
        │           │   VERSIONS        │
        │           │───────────────────│
        └──────────►│ id (PK)           │
                    │ tenant_id (FK)    │
                    │ generation_id(FK) │
                    │ version_number    │
                    │ output_url        │
                    │ parameters        │
                    └───────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      BILLING & USAGE                            │
└────────────────────────────────────────────────────────────────┘

        ┌─────────────┐           ┌──────────────┐
        │  TENANTS    │           │ USER_PROFILES│
        └──────┬──────┘           └──────┬───────┘
               │                         │
      ┌────────┼────────┐               │
      │        │        │               │
┌─────▼──────┐ │ ┌──────▼────────┐    │
│CREDIT_     │ │ │SUBSCRIPTIONS  │    │
│BALANCES    │ │ │───────────────│    │
│────────────│ │ │id (PK)        │    │
│tenant_id(PK│ │ │tenant_id (FK) │    │
│credits_    │ │ │plan_type      │    │
│available   │ │ │status         │    │
│credits_    │ │ │billing_interval   │
│consumed    │ │ │price_amount   │    │
└─────┬──────┘ │ │credits_per_mo │    │
      │        │ └───────────────┘    │
      │        │                      │
┌─────▼────────▼┐              ┌─────▼────────┐
│CREDIT_        │              │ USAGE_LOGS   │
│TRANSACTIONS   │              │──────────────│
│───────────────│              │ id (PK)      │
│id (PK)        │              │ tenant_id(FK)│
│tenant_id (FK) │              │ user_id (FK) │
│type           │              │ resource_type│
│amount         │              │ resource_id  │
│balance_before │              │ credits_used │
│balance_after  │              │ quantity     │
│description    │              │ metadata     │
└───────────────┘              └──────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   COLLABORATION & SHARING                       │
└────────────────────────────────────────────────────────────────┘

        ┌─────────────┐           ┌──────────────┐
        │  TENANTS    │           │ USER_PROFILES│
        └──────┬──────┘           └──────┬───────┘
               │                         │
      ┌────────┼─────────────────────────┼────────┐
      │        │                         │        │
┌─────▼──────┐│┌────────▼───────┐ ┌─────▼──────┐│
│SHARED_     │││ COMMENTS       │ │NOTIFICATIONS││
│CONTENT     │││────────────────│ │─────────────││
│────────────│││ id (PK)        │ │id (PK)      ││
│id (PK)     │││ tenant_id (FK) │ │tenant_id(FK)││
│tenant_id   │││ content_type   │ │user_id (FK) ││
│shared_by   │││ content_id     │ │type         ││
│content_type│││ user_id (FK)   │ │title        ││
│content_id  │││ parent_id (FK) │ │message      ││
│share_token │││ content        │ │is_read      ││
│share_type  │││ mentions[]     │ │action_url   ││
│permissions │││ is_edited      │ └─────────────┘│
│expires_at  │││ is_deleted     │                │
│view_count  │││ created_at     │                │
└────────────┘││ updated_at     │                │
              │└────────────────┘                │
              │                                  │
              │┌────────────────┐                │
              ││TEAM_           │                │
              ││INVITATIONS     │                │
              ││────────────────│                │
              ││id (PK)         │                │
              ││tenant_id (FK)  │                │
              ││invited_email   │                │
              ││invited_by (FK) │                │
              ││role            │                │
              ││invitation_token│                │
              ││status          │                │
              ││expires_at      │                │
              │└────────────────┘                │
              └──────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION & AUDIT                        │
└────────────────────────────────────────────────────────────────┘

        ┌─────────────┐           ┌──────────────┐
        │  TENANTS    │           │ USER_PROFILES│
        └──────┬──────┘           └──────┬───────┘
               │                         │
      ┌────────┼─────────────────────────┼────────┐
      │        │                         │        │
┌─────▼──────┐│┌────────▼───────┐ ┌─────▼──────┐│
│MODEL_      │││ API_KEYS       │ │ AUDIT_LOGS ││
│CONFIGS     │││────────────────│ │────────────││
│────────────│││ id (PK)        │ │id (PK)     ││
│id (PK)     │││ tenant_id (FK) │ │tenant_id   ││
│tenant_id   │││ created_by(FK) │ │user_id     ││
│model_name  │││ name           │ │action      ││
│studio_type │││ key_hash       │ │resource_type│
│parameters  │││ key_prefix     │ │resource_id ││
│is_enabled  │││ scopes[]       │ │changes     ││
│endpoint    │││ rate_limit     │ │ip_address  ││
└────────────┘││ last_used_at   │ │user_agent  ││
              ││ expires_at     │ │metadata    ││
              ││ is_active      │ │created_at  ││
              │└────────────────┘ └────────────┘│
              └──────────────────────────────────┘
```

## Table Groups and Relationships

### 1. Core Multi-Tenant Infrastructure

```
TENANTS (1) ──────────── (*) USER_PROFILES
    │                            │
    │                            │
    ├─────── (*) ROLES           ├─── (*) USER_ROLES
    │                            │
    └─────── (1) TENANT_SETTINGS └─── (*) PROJECTS
                                      (*) GENERATIONS
                                      (*) ASSETS
```

**Purpose**: Foundation for multi-tenant architecture
**Key Feature**: All data scoped to tenants

### 2. Content Creation Hierarchy

```
USER_PROFILES
    │
    ├─── PROJECTS
    │       │
    │       ├─── GENERATION_HISTORY
    │       │       │
    │       │       └─── GENERATION_VERSIONS
    │       │
    │       └─── ASSETS
    │
    └─── COMMENTS (on any content)
```

**Purpose**: Organize AI-generated content
**Key Feature**: Project-based organization

### 3. Billing & Resource Tracking

```
TENANTS ──── CREDIT_BALANCES
    │            │
    │            └─── CREDIT_TRANSACTIONS
    │
    ├─── SUBSCRIPTIONS
    │
    └─── USAGE_LOGS ◄─── USER_PROFILES
```

**Purpose**: Track usage and manage billing
**Key Feature**: Credit-based system

### 4. Collaboration Features

```
TENANTS ──── SHARED_CONTENT
    │            (share generations/projects)
    │
    ├─── COMMENTS ◄─── USER_PROFILES
    │       (threaded discussions)
    │
    ├─── NOTIFICATIONS ◄─── USER_PROFILES
    │       (real-time alerts)
    │
    └─── TEAM_INVITATIONS
            (member management)
```

**Purpose**: Team collaboration and sharing
**Key Feature**: Secure external sharing

### 5. Configuration & Security

```
TENANTS ──── MODEL_CONFIGURATIONS
    │            (custom AI settings)
    │
    ├─── API_KEYS ◄─── USER_PROFILES
    │       (programmatic access)
    │
    └─── AUDIT_LOGS ◄─── USER_PROFILES
            (security trail)
```

**Purpose**: System configuration and security
**Key Feature**: Complete audit trail

## Data Flow Diagrams

### User Signup Flow

```
1. User Signs Up
   │
   ├─► Create in auth.users (Supabase Auth)
   │
   ├─► Create TENANT
   │     - Generate unique slug
   │     - Set default plan (free)
   │     - Set default limits
   │
   ├─► Create USER_PROFILE
   │     - Link to auth.users
   │     - Link to tenant
   │     - Set as owner
   │     - Mark as admin
   │
   ├─► Assign Tenant Owner ROLE
   │     - Create USER_ROLE entry
   │
   ├─► Initialize Tenant
   │     - Create CREDIT_BALANCE (100 free credits)
   │     - Create TENANT_SETTINGS (defaults)
   │     - Create CREDIT_TRANSACTION (welcome bonus)
   │
   └─► Log AUDIT_LOG
         - Action: user_signup
```

### Generation Creation Flow

```
1. User Creates Generation
   │
   ├─► Check CREDIT_BALANCE
   │     - Verify sufficient credits
   │
   ├─► Create GENERATION_HISTORY
   │     - Set status: pending
   │     - Store prompt, model, parameters
   │
   ├─► Deduct Credits
   │     - Update CREDIT_BALANCE
   │     - Create USAGE_LOG
   │
   ├─► Process Generation (External AI)
   │     - Call AI model API
   │     - Upload output to storage
   │
   ├─► Update GENERATION_HISTORY
   │     - Set status: completed
   │     - Store output_url
   │     - Record processing_time
   │
   ├─► Create NOTIFICATION
   │     - Type: generation_complete
   │     - Link to generation
   │
   └─► Optional: Create GENERATION_VERSION
         - If user iterates
```

### Content Sharing Flow

```
1. User Shares Content
   │
   ├─► Create SHARED_CONTENT
   │     - Generate secure share_token
   │     - Set permissions (view, download)
   │     - Set expiration (optional)
   │
   ├─► Log AUDIT_LOG
   │     - Action: content_shared
   │
   └─► Return Share URL
         - Format: /shared/{token}

2. External User Accesses
   │
   ├─► Lookup SHARED_CONTENT by token
   │     - Verify not expired
   │     - Verify is_active
   │
   ├─► Increment view_count
   │     - Update last_accessed_at
   │
   └─► Return Content
         - Based on content_type
```

## Security Architecture

### Row-Level Security (RLS) Pattern

Every table follows this policy pattern:

```sql
-- Users can only see data in their tenant
CREATE POLICY "tenant_isolation_select"
  ON table_name FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );

-- Users can only insert data to their tenant
CREATE POLICY "tenant_isolation_insert"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles
      WHERE id = auth.uid()
    )
  );
```

### Permission Checking

```
User Request
    │
    ├─► Check Authentication
    │     - Verify auth.uid() exists
    │
    ├─► Check Tenant Membership
    │     - Lookup user_profiles.tenant_id
    │
    ├─► Check Role Permissions
    │     - Query user_roles
    │     - Check role.permissions
    │     - Call user_has_permission()
    │
    ├─► Apply RLS Policies
    │     - PostgreSQL automatically filters
    │
    └─► Execute Query
          - Only see/modify allowed data
```

## Indexing Strategy

### Performance-Critical Indexes

```
Every Multi-Tenant Table:
  ├─► idx_{table}_tenant_id (tenant isolation)
  └─► idx_{table}_created_at (time-based queries)

Foreign Keys:
  └─► idx_{table}_{fk_column} (join optimization)

Common Filters:
  ├─► idx_{table}_status (active/pending/etc)
  ├─► idx_{table}_type (generation_type/asset_type)
  └─► idx_{table}_is_public (public content)

Composite Indexes:
  ├─► idx_notifications_user_unread (user_id, is_read, created_at)
  ├─► idx_usage_logs_tenant_created (tenant_id, created_at)
  └─► idx_{table}_tenant_{filter} (common combinations)

Special Indexes:
  ├─► GIN indexes on JSONB columns (metadata, parameters)
  ├─► GIN indexes on arrays (tags[], scopes[])
  └─► Partial indexes on active records
```

## Scalability Considerations

### Horizontal Scaling

```
Application Layer (Multiple Instances)
    │
    ├─► Connection Pooler (PgBouncer)
    │     - Manages connection limits
    │     - Transaction pooling
    │
    ├─► Primary Database (Write)
    │     - All INSERT/UPDATE/DELETE
    │     - Real-time data
    │
    └─► Read Replicas (Read)
          - SELECT queries
          - Analytics
          - Reporting
```

### Vertical Scaling

```
As Data Grows:
  ├─► Increase Database Resources
  │     - More CPU/RAM
  │     - Faster storage (SSD)
  │
  ├─► Partition Large Tables
  │     - usage_logs by month
  │     - audit_logs by month
  │     - generation_history by tenant
  │
  └─► Archive Old Data
        - Move old audit_logs
        - Compress old generations
        - Backup and remove
```

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total Tables** | 20 |
| **Core Tables** | 4 |
| **Content Tables** | 4 |
| **Billing Tables** | 4 |
| **Collaboration Tables** | 4 |
| **Configuration Tables** | 4 |
| **Foreign Keys** | 40+ |
| **RLS Policies** | 60+ |
| **Indexes** | 50+ |
| **Helper Functions** | 4 |
| **System Roles** | 5 |
| **Check Constraints** | 25+ |

---

**Schema Version**: 1.0
**Last Updated**: 2026-03-14
**Status**: Production Ready
