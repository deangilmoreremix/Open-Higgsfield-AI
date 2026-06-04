// Video Status enum
export type VideoStatus = 
  | "none" 
  | "demo_scheduled" 
  | "demo_started" 
  | "demo_finished" 
  | "final_progress" 
  | "final"

// Company type
export interface Company {
  id: string
  name: string
  websiteUrl: string
  employees: number
  industry: string
  campaignId: string
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  logoUrl?: string
  valueProp?: string
  features?: string[]
  targetAudience?: string
  voiceTone?: string
  videoStatus: VideoStatus
  createdAt: string
  updatedAt: string
  jobId?: string // Enrichment job ID when creating
}

// Company create/update payload
export interface CompanyInput {
  name: string
  websiteUrl: string
  campaignId: string
  industry: string
  employees?: number
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  logoUrl?: string
  valueProp?: string
  features?: string[]
  targetAudience?: string
  voiceTone?: string
  videoStatus?: VideoStatus
}

// Employee type
export interface Employee {
  id: string
  companyId: string
  firstName: string
  lastName: string
  jobTitle: string
  email: string
  avatarUrl: string
  linkedinUrl: string
  createdAt: string
  updatedAt: string
}

// Employee create/update payload
export interface EmployeeInput {
  companyId: string
  firstName: string
  lastName: string
  jobTitle: string
  email: string
  avatarUrl: string
  linkedinUrl: string
}

// Demo Video type
export interface DemoVideo {
  id: string
  companyId: string
  videoLink: string
  views: number
  lastViewedAt: string | null
  createdAt: string
  updatedAt: string
}

// Queue Status type
export interface QueueStatus {
  enrichment: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }
  videoGeneration: {
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }
}

// Video Template type
export interface VideoTemplate {
  name: string
  requiredVariables: string[]
}

// API Error response
export interface ApiError {
  error: string
  details?: string
}

// CSV column mapping
export interface ColumnMapping {
  csvColumn: string
  targetField: string
}

// Company CSV fields that can be mapped
export const COMPANY_FIELDS = [
  { value: "name", label: "Name", required: true },
  { value: "websiteUrl", label: "Website URL", required: true },
  { value: "campaignId", label: "Campaign ID", required: true },
  { value: "industry", label: "Industry", required: true },
  { value: "employees", label: "Employees", required: false },
] as const

// Employee CSV fields that can be mapped
export const EMPLOYEE_FIELDS = [
  { value: "companyId", label: "Company ID", required: true },
  { value: "firstName", label: "First Name", required: true },
  { value: "lastName", label: "Last Name", required: true },
  { value: "jobTitle", label: "Job Title", required: true },
  { value: "email", label: "Email", required: true },
  { value: "avatarUrl", label: "Avatar URL", required: true },
  { value: "linkedinUrl", label: "LinkedIn URL", required: true },
] as const

// Video status display configuration
export const VIDEO_STATUS_CONFIG: Record<VideoStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  none: { label: "None", variant: "secondary" },
  demo_scheduled: { label: "Scheduled", variant: "info" },
  demo_started: { label: "Started", variant: "warning" },
  demo_finished: { label: "Demo Ready", variant: "success" },
  final_progress: { label: "Final In Progress", variant: "warning" },
  final: { label: "Final", variant: "success" },
}
