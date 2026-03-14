/*
  # Multi-Tenant Schema - Part 3: Usage Tracking, Billing, and Audit Logs

  ## Overview
  Creates tables for resource usage monitoring, billing, subscriptions, and audit logging.

  ## Tables Created

  ### 1. usage_logs
  Tracks resource consumption for billing and analytics.
  - `id` (uuid, PK): Log entry identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `user_id` (uuid, FK to user_profiles): User who used resource
  - `resource_type` (text): Type of resource (generation, storage, api_call)
  - `resource_id` (uuid): Reference to specific resource
  - `studio_type` (text): Which studio was used
  - `credits_consumed` (numeric): Cost in credits
  - `quantity` (numeric): Amount used (e.g., seconds, MB)
  - `unit` (text): Unit of measurement
  - `metadata` (jsonb): Additional tracking data
  - `created_at` (timestamptz): Usage timestamp

  ### 2. credit_balances
  Current credit balance for each tenant.
  - `tenant_id` (uuid, PK, FK to tenants): Tenant identifier
  - `credits_available` (numeric): Current balance
  - `credits_consumed` (numeric): Lifetime usage
  - `credits_purchased` (numeric): Total purchased
  - `last_recharged_at` (timestamptz): Last top-up
  - `updated_at` (timestamptz): Last balance change

  ### 3. credit_transactions
  History of credit purchases and adjustments.
  - `id` (uuid, PK): Transaction identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `transaction_type` (text): Type (purchase, grant, refund, adjustment)
  - `amount` (numeric): Credit change (positive or negative)
  - `balance_before` (numeric): Balance before transaction
  - `balance_after` (numeric): Balance after transaction
  - `description` (text): Transaction description
  - `payment_method` (text): How credits were acquired
  - `payment_reference` (text): External payment ID
  - `processed_by` (uuid, FK to user_profiles): Admin who processed
  - `metadata` (jsonb): Additional transaction data
  - `created_at` (timestamptz): Transaction timestamp

  ### 4. subscriptions
  Manages subscription plans and billing cycles.
  - `id` (uuid, PK): Subscription identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `plan_type` (text): Subscription tier
  - `status` (text): Subscription state
  - `billing_interval` (text): Frequency (monthly, yearly)
  - `price_amount` (numeric): Cost per interval
  - `currency` (text): Billing currency
  - `credits_per_month` (int): Monthly credit allocation
  - `started_at` (timestamptz): Subscription start
  - `current_period_start` (timestamptz): Current billing period start
  - `current_period_end` (timestamptz): Current billing period end
  - `cancelled_at` (timestamptz): Cancellation timestamp
  - `trial_ends_at` (timestamptz): Trial expiration
  - `payment_provider` (text): Billing provider (stripe, etc.)
  - `payment_provider_id` (text): External subscription ID
  - `metadata` (jsonb): Additional subscription data
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last modification

  ### 5. audit_logs
  Comprehensive audit trail for security and compliance.
  - `id` (uuid, PK): Log entry identifier
  - `tenant_id` (uuid, FK to tenants): Tenant scope
  - `user_id` (uuid, FK to user_profiles): User who performed action
  - `action` (text): Action performed
  - `resource_type` (text): Affected resource type
  - `resource_id` (uuid): Affected resource identifier
  - `changes` (jsonb): Before/after values
  - `ip_address` (inet): Request IP
  - `user_agent` (text): Client information
  - `metadata` (jsonb): Additional context
  - `created_at` (timestamptz): Action timestamp

  ### 6. api_keys
  Programmatic access tokens for integrations.
  - `id` (uuid, PK): API key identifier
  - `tenant_id` (uuid, FK to tenants): Tenant ownership
  - `created_by` (uuid, FK to user_profiles): Creator
  - `name` (text): Key description
  - `key_hash` (text): Hashed API key (never store plain)
  - `key_prefix` (text): First chars for identification
  - `scopes` (text[]): Permitted operations
  - `rate_limit_per_hour` (int): Request limit
  - `last_used_at` (timestamptz): Last usage
  - `expires_at` (timestamptz): Expiration timestamp
  - `is_active` (boolean): Enable/disable flag
  - `created_at` (timestamptz): Creation timestamp

  ## Security
  - RLS enabled on all tables
  - Audit logs are append-only (no UPDATE/DELETE policies)
  - API keys store only hashes, never plain text
  - Credit transactions maintain balance integrity

  ## Indexes
  - Optimized for analytics and reporting queries
  - Time-based indexes for usage tracking
  - Tenant isolation indexes
*/

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('generation', 'storage', 'api_call', 'upscale', 'training')),
  resource_id uuid,
  studio_type text,
  credits_consumed numeric(10, 4) NOT NULL DEFAULT 0,
  quantity numeric(15, 4),
  unit text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create credit_balances table
CREATE TABLE IF NOT EXISTS credit_balances (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  credits_available numeric(15, 4) NOT NULL DEFAULT 0 CHECK (credits_available >= 0),
  credits_consumed numeric(15, 4) NOT NULL DEFAULT 0 CHECK (credits_consumed >= 0),
  credits_purchased numeric(15, 4) NOT NULL DEFAULT 0 CHECK (credits_purchased >= 0),
  last_recharged_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'grant', 'refund', 'adjustment', 'bonus')),
  amount numeric(15, 4) NOT NULL,
  balance_before numeric(15, 4) NOT NULL,
  balance_after numeric(15, 4) NOT NULL,
  description text NOT NULL,
  payment_method text,
  payment_reference text,
  processed_by uuid REFERENCES user_profiles(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'pro', 'enterprise', 'custom')),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused')),
  billing_interval text NOT NULL CHECK (billing_interval IN ('monthly', 'yearly', 'one_time')),
  price_amount numeric(10, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  credits_per_month int DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  cancelled_at timestamptz,
  trial_ends_at timestamptz,
  payment_provider text,
  payment_provider_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  scopes text[] DEFAULT ARRAY[]::text[],
  rate_limit_per_hour int DEFAULT 1000,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_resource_type ON usage_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_created ON usage_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_tenant_id ON credit_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_logs
CREATE POLICY "Users can view usage logs in their tenant"
  ON usage_logs FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert usage logs"
  ON usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for credit_balances
CREATE POLICY "Users can view their tenant credit balance"
  ON credit_balances FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can update credit balance"
  ON credit_balances FOR ALL
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

-- RLS Policies for credit_transactions
CREATE POLICY "Users can view transactions in their tenant"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can insert credit transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND is_tenant_admin = true
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their tenant subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage subscriptions"
  ON subscriptions FOR ALL
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

-- RLS Policies for audit_logs (append-only)
CREATE POLICY "Users can view audit logs in their tenant"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for api_keys
CREATE POLICY "Users can view API keys in their tenant"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Tenant admins can manage API keys"
  ON api_keys FOR ALL
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
CREATE TRIGGER update_credit_balances_updated_at
  BEFORE UPDATE ON credit_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();