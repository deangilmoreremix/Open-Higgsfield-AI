// Server-side API - calls external API directly (no CORS issues on server)
import type { Company, DemoVideo } from "./types"

// Re-export types
export type { Company, DemoVideo }

// API configuration from environment
const API_URL = process.env.API_URL
const API_SECRET = process.env.SECRET || ""

// Simple fetch wrapper for server-side
async function serverFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "x-api-key": API_SECRET,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} for ${endpoint}`)
      return null
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    console.error("Server fetch error:", error)
    return null
  }
}

// Company API functions
export async function getCompanyByName(name: string): Promise<Company | null> {
  const companies = await serverFetch<Company[]>(`/api/companies?name=${encodeURIComponent(name)}`)
  return companies?.[0] || null
}

export async function getAllCompanies(): Promise<Company[]> {
  return await serverFetch<Company[]>("/api/companies") || []
}

// Demo Video API function
export async function getDemoVideo(companyId: string): Promise<DemoVideo | null> {
  return serverFetch<DemoVideo>(`/api/videos/demo/${companyId}`)
}
