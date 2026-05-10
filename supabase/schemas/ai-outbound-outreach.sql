-- AI Outbound Outreach Supabase Schema
-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text default 'free',
  role text default 'user',
  created_at timestamptz default now()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  brand_name text,
  logo_url text,
  primary_color text,
  cta_button_color text,
  custom_footer_text text,
  created_at timestamptz default now()
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamptz default now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text default 'personalized_video',
  base_video_url text,
  base_thumbnail_url text,
  offer text,
  audience text,
  cta_text text,
  cta_url text,
  calendar_url text,
  personalization_mode text default 'personalized_page',
  status text default 'draft',
  landing_page_slug text unique,
  created_at timestamptz default now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  company text,
  website text,
  industry text,
  city text,
  custom_fields jsonb default '{}',
  created_at timestamptz default now()
);

-- Personalized scripts table
CREATE TABLE IF NOT EXISTS public.personalized_scripts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  hook text,
  script text,
  subject_line text,
  email_body text,
  cta text,
  prompt jsonb default '{}',
  status text default 'draft',
  created_at timestamptz default now()
);

-- Generation jobs table
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  provider text not null,
  provider_job_id text,
  workflow_id text,
  status text default 'queued',
  input jsonb default '{}',
  output jsonb default '{}',
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Personalized videos table
CREATE TABLE IF NOT EXISTS public.personalized_videos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  script_id uuid references personalized_scripts(id),
  generation_job_id uuid references generation_jobs(id),
  video_url text,
  thumbnail_url text,
  landing_page_slug text unique,
  landing_page_url text,
  embed_code text,
  status text default 'draft',
  created_at timestamptz default now()
);

-- Video events table
CREATE TABLE IF NOT EXISTS public.video_events (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references personalized_videos(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  contact_id uuid references contacts(id),
  event_type text not null,
  metadata jsonb default '{}',
  ip_hash text,
  user_agent text,
  created_at timestamptz default now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id),
  video_id uuid references personalized_videos(id),
  contact_id uuid references contacts(id),
  name text,
  email text,
  phone text,
  message text,
  form_data jsonb default '{}',
  created_at timestamptz default now()
);

-- MuAPI workflows table
CREATE TABLE IF NOT EXISTS public.muapi_workflows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  workflow_id text not null,
  input_schema jsonb default '{}',
  output_type text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muapi_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic examples, extend as needed)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Workspace members can access workspace data" ON public.workspaces FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = workspaces.id AND user_id = auth.uid()));
CREATE POLICY "Workspace members can access campaigns" ON public.campaigns FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = campaigns.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Workspace members can access contacts" ON public.contacts FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = contacts.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Workspace members can access scripts" ON public.personalized_scripts FOR ALL USING (EXISTS (SELECT 1 FROM campaigns JOIN workspace_members ON campaigns.workspace_id = workspace_members.workspace_id WHERE campaigns.id = personalized_scripts.campaign_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Workspace members can access generation jobs" ON public.generation_jobs FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = generation_jobs.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Workspace members can access personalized videos" ON public.personalized_videos FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = personalized_videos.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Public can insert video events" ON public.video_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Workspace members can view video events" ON public.video_events FOR SELECT USING (EXISTS (SELECT 1 FROM personalized_videos JOIN workspace_members ON personalized_videos.workspace_id = workspace_members.workspace_id WHERE personalized_videos.id = video_events.video_id AND workspace_members.user_id = auth.uid()));
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Workspace members can access leads" ON public.leads FOR ALL USING (EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = leads.workspace_id AND user_id = auth.uid()));
CREATE POLICY "Authenticated users can view active MuAPI workflows" ON public.muapi_workflows FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');
