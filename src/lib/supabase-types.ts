// Supabase types for VideoRemix MVP
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: 'free' | 'pro' | 'agency';
  role: 'user' | 'admin';
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  cta_button_color: string | null;
  custom_footer_text: string | null;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface Campaign {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  type: string;
  base_video_url: string | null;
  base_thumbnail_url: string | null;
  offer: string | null;
  audience: string | null;
  cta_text: string | null;
  cta_url: string | null;
  calendar_url: string | null;
  personalization_mode: 'personalized_page' | 'ai_intro' | 'full_ai' | 'muapi_workflow' | 'ai_clone';
  status: 'draft' | 'active' | 'paused' | 'completed';
  landing_page_slug: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  workspace_id: string;
  campaign_id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  company: string | null;
  website: string | null;
  industry: string | null;
  city: string | null;
  custom_fields: Record<string, any>;
  created_at: string;
}

export interface PersonalizedScript {
  id: string;
  campaign_id: string;
  contact_id: string;
  hook: string | null;
  script: string | null;
  subject_line: string | null;
  email_body: string | null;
  cta: string | null;
  prompt: Record<string, any>;
  status: 'draft' | 'generated' | 'approved';
  created_at: string;
}

export interface GenerationJob {
  id: string;
  workspace_id: string;
  campaign_id: string;
  contact_id: string;
  provider: 'muapi';
  provider_job_id: string | null;
  workflow_id: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input: Record<string, any>;
  output: Record<string, any>;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedVideo {
  id: string;
  workspace_id: string;
  campaign_id: string;
  contact_id: string;
  script_id: string | null;
  generation_job_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  landing_page_slug: string | null;
  landing_page_url: string | null;
  embed_code: string | null;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

export interface VideoEvent {
  id: string;
  video_id: string;
  campaign_id: string;
  contact_id: string | null;
  event_type: 'view' | 'play' | 'pause' | 'cta_click' | 'form_submit' | 'calendar_click';
  metadata: Record<string, any>;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  campaign_id: string;
  video_id: string | null;
  contact_id: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  form_data: Record<string, any>;
  created_at: string;
}

export interface MuapiWorkflow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  workflow_id: string;
  input_schema: Record<string, any>;
  output_type: string;
  is_active: boolean;
  created_at: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
      };
      workspaces: {
        Row: Workspace;
        Insert: Workspace;
        Update: Partial<Workspace>;
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: WorkspaceMember;
        Update: Partial<WorkspaceMember>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Campaign;
        Update: Partial<Campaign>;
      };
      contacts: {
        Row: Contact;
        Insert: Contact;
        Update: Partial<Contact>;
      };
      personalized_scripts: {
        Row: PersonalizedScript;
        Insert: PersonalizedScript;
        Update: Partial<PersonalizedScript>;
      };
      generation_jobs: {
        Row: GenerationJob;
        Insert: GenerationJob;
        Update: Partial<GenerationJob>;
      };
      personalized_videos: {
        Row: PersonalizedVideo;
        Insert: PersonalizedVideo;
        Update: Partial<PersonalizedVideo>;
      };
      video_events: {
        Row: VideoEvent;
        Insert: VideoEvent;
        Update: Partial<VideoEvent>;
      };
      leads: {
        Row: Lead;
        Insert: Lead;
        Update: Partial<Lead>;
      };
      muapi_workflows: {
        Row: MuapiWorkflow;
        Insert: MuapiWorkflow;
        Update: Partial<MuapiWorkflow>;
      };
    };
    Views: {};
    Functions: {
      is_workspace_member: (workspace_id: string) => boolean;
    };
  };
}
