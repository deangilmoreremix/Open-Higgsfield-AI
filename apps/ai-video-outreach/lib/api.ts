import type { 
  Company, 
  CompanyInput, 
  Employee, 
  EmployeeInput, 
  DemoVideo, 
  QueueStatus, 
  VideoTemplate,
  ApiError 
} from "./types"

// Use the Next.js API proxy to avoid CORS issues
const API_URL = "/api/proxy"

class ApiClient {
  private apiKey: string = ""

  setApiKey(key: string) {
    this.apiKey = key
  }

  getApiKey(): string {
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = ""
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }))
      throw new Error(error.error || error.details || "Unknown error")
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) return {} as T
    
    return JSON.parse(text)
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await this.request("/health")
      return true
    } catch {
      return false
    }
  }

  // Companies
  async getCompanies(filters?: {
    name?: string
    websiteUrl?: string
    industry?: string
    campaignId?: string
    videoStatus?: string
  }): Promise<Company[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Company[]>(`/api/companies${query}`)
  }

  async createCompanies(companies: CompanyInput[]): Promise<Company[]> {
    return this.request<Company[]>("/api/companies", {
      method: "POST",
      body: JSON.stringify(companies),
    })
  }

  async updateCompany(id: string, data: Partial<CompanyInput>): Promise<Company> {
    return this.request<Company>(`/api/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteCompany(id: string): Promise<Company> {
    return this.request<Company>(`/api/companies/${id}`, {
      method: "DELETE",
    })
  }

  // Employees
  async getEmployees(filters?: {
    companyId?: string
    firstName?: string
    lastName?: string
    jobTitle?: string
    email?: string
  }): Promise<Employee[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Employee[]>(`/api/employees${query}`)
  }

  async createEmployees(employees: EmployeeInput[]): Promise<Employee[]> {
    return this.request<Employee[]>("/api/employees", {
      method: "POST",
      body: JSON.stringify(employees),
    })
  }

  async updateEmployee(id: string, data: Partial<EmployeeInput>): Promise<Employee> {
    return this.request<Employee>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteEmployee(id: string): Promise<Employee> {
    return this.request<Employee>(`/api/employees/${id}`, {
      method: "DELETE",
    })
  }

  // Videos
  async getDemoVideo(companyId: string): Promise<DemoVideo> {
    return this.request<DemoVideo>(`/api/videos/demo/${companyId}`)
  }

  async getQueueStatus(): Promise<QueueStatus> {
    return this.request<QueueStatus>("/api/videos/queues/status")
  }

  async getVideoTemplates(): Promise<{ templates: VideoTemplate[] }> {
    return this.request<{ templates: VideoTemplate[] }>("/api/videos/templates")
  }

  async retryEnrichmentByCompanyId(companyId: string): Promise<{ success: boolean; message: string; jobId?: string }> {
    return this.request<{ success: boolean; message: string; jobId?: string }>(
      `/api/videos/queues/enrichment/company/${companyId}/retry`,
      { method: "POST", body: JSON.stringify({}) }
    )
  }

  async retryVideoByCompanyId(companyId: string): Promise<{ success: boolean; message: string; jobId?: string }> {
    return this.request<{ success: boolean; message: string; jobId?: string }>(
      `/api/videos/queues/video/company/${companyId}/retry`,
      { method: "POST", body: JSON.stringify({}) }
    )
  }
}

// Singleton instance
export const api = new ApiClient()
