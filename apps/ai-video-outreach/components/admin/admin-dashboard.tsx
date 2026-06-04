"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import type { Company, Employee, QueueStatus, VideoStatus } from "@/lib/types"
import { VIDEO_STATUS_CONFIG } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react"
import { 
  KeyRound, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Pencil,
  Trash2,
  Video,
  UserPlus,
  Upload,
  Building2,
  Users,
  BarChart3,
  LogOut,
  Download
} from "lucide-react"
import { toast } from "sonner"
import { CsvImportDialog } from "./csv-import-dialog"
import { CompanyEditDialog } from "./company-edit-dialog"
import { EmployeeAddDialog } from "./employee-add-dialog"
import { SalesNavigatorImportDialog } from "./sales-navigator-import-dialog"

export function AdminDashboard() {
  // Auth state
  const [apiKey, setApiKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Data state
  const [companies, setCompanies] = useState<Company[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // UI state
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
  
  // Dialog states
  const [csvImportOpen, setCsvImportOpen] = useState(false)
  const [csvImportType, setCsvImportType] = useState<"companies" | "employees">("companies")
  const [salesNavImportOpen, setSalesNavImportOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [addingEmployeeToCompany, setAddingEmployeeToCompany] = useState<Company | null>(null)

  // Get unique campaign IDs
  const campaignIds = [...new Set(companies.map(c => c.campaignId))].sort()

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [companiesData, employeesData, queueData] = await Promise.all([
        api.getCompanies(),
        api.getEmployees(),
        api.getQueueStatus(),
      ])
      setCompanies(companiesData)
      setEmployees(employeesData)
      setQueueStatus(queueData)
    } catch (error) {
      toast.error("Failed to fetch data", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auth handler
  const handleAuthenticate = async () => {
    setIsAuthenticating(true)
    setAuthError(null)
    
    api.setApiKey(apiKey)
    
    try {
      const isHealthy = await api.checkHealth()
      if (isHealthy) {
        setIsAuthenticated(true)
        fetchData()
      } else {
        setAuthError("Failed to connect to API. Please check your API key.")
        api.clearApiKey()
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed")
      api.clearApiKey()
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Logout handler
  const handleLogout = () => {
    api.clearApiKey()
    setIsAuthenticated(false)
    setApiKey("")
    setCompanies([])
    setEmployees([])
    setQueueStatus(null)
  }

  // Toggle company expansion
  const toggleCompanyExpansion = (companyId: string) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev)
      if (next.has(companyId)) {
        next.delete(companyId)
      } else {
        next.add(companyId)
      }
      return next
    })
  }

  // Get employees for a company
  const getCompanyEmployees = (companyId: string) => {
    return employees.filter(e => e.companyId === companyId)
  }

  // Company actions
  const handleRetryEnrichment = async (company: Company) => {
    try {
      await api.retryEnrichmentByCompanyId(company.id)
      toast.success("Enrichment job retried successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to retry enrichment", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleRetryVideo = async (company: Company) => {
    try {
      await api.retryVideoByCompanyId(company.id)
      toast.success("Video job retried successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to retry video generation", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete ${company.name}?`)) return
    try {
      await api.deleteCompany(company.id)
      toast.success("Company deleted successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete company", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const handleViewDemo = async (company: Company) => {
    try {
      const demo = await api.getDemoVideo(company.id)
      if (demo.videoLink) {
        window.open(demo.videoLink, "_blank")
      } else {
        toast.error("No demo video available")
      }
    } catch (error) {
      toast.error("Failed to get demo video", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Employee actions
  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) return
    try {
      await api.deleteEmployee(employee.id)
      toast.success("Employee deleted successfully")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete employee", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Filter companies by campaign
  const filteredCompanies = selectedCampaignId
    ? companies.filter(c => c.campaignId === selectedCampaignId)
    : companies

  // Export demo finished companies with employees as CSV
  const handleExportDemoFinished = () => {
    // Require a specific campaign to be selected
    if (!selectedCampaignId) {
      toast.error("Please select a campaign first")
      return
    }

    // Filter companies with demo_finished status
    const demoFinishedCompanies = filteredCompanies.filter(
      c => c.videoStatus === "demo_finished"
    )

    if (demoFinishedCompanies.length === 0) {
      toast.error("No companies with demo finished status to export")
      return
    }

    // Build CSV rows: one row per employee with company data
    const csvRows: string[][] = []
    
    // Header row
    const headers = [
      "Employee First Name",
      "Employee Last Name",
      "Employee Job Title",
      "Employee Email",
      "Employee LinkedIn URL",
      "Company Name",
      "Company Website",
      "Company Industry",
      "Company Employees",
      "Company Campaign ID",
      "Company Video Status",
      "Company Created At",
      "Landing URL"
    ]
    csvRows.push(headers)

    // Data rows
    demoFinishedCompanies.forEach(company => {
      const companyEmployees = employees.filter(e => e.companyId === company.id)
      
      const landingUrl = `https://chocomotion.agency/${encodeURIComponent(company.name)}`
      
      if (companyEmployees.length === 0) {
        // Include company even if no employees (with empty employee fields)
        csvRows.push([
          "", // firstName
          "", // lastName
          "", // jobTitle
          "", // email
          "", // linkedinUrl
          company.name,
          company.websiteUrl,
          company.industry,
          String(company.employees),
          company.campaignId,
          company.videoStatus,
          new Date(company.createdAt).toLocaleDateString(),
          landingUrl
        ])
      } else {
        companyEmployees.forEach(emp => {
          csvRows.push([
            emp.firstName,
            emp.lastName,
            emp.jobTitle,
            emp.email,
            emp.linkedinUrl,
            company.name,
            company.websiteUrl,
            company.industry,
            String(company.employees),
            company.campaignId,
            company.videoStatus,
            new Date(company.createdAt).toLocaleDateString(),
            landingUrl
          ])
        })
      }
    })

    // Convert to CSV string with proper escaping
    const csvContent = csvRows
      .map(row =>
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = String(cell).replace(/"/g, '""')
          return /[,"\n\r]/.test(escaped) ? `"${escaped}"` : escaped
        }).join(",")
      )
      .join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const filename = `demo-finished-${selectedCampaignId}-${new Date().toISOString().split("T")[0]}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${csvRows.length - 1} rows to CSV`)
  }

  // Bulk retry video generation for companies with features but no video
  const [isRetryingVideos, setIsRetryingVideos] = useState(false)
  
  const handleBulkRetryVideos = async () => {
    // Require a specific campaign to be selected
    if (!selectedCampaignId) {
      toast.error("Please select a campaign first")
      return
    }

    // Find companies with features but videoStatus === "none"
    const companiesNeedingRetry = filteredCompanies.filter(
      c => c.videoStatus === "none" && c.features && c.features.length > 0
    )

    if (companiesNeedingRetry.length === 0) {
      toast.error("No companies with features and 'none' video status found")
      return
    }

    setIsRetryingVideos(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const company of companiesNeedingRetry) {
        try {
          await api.retryVideoByCompanyId(company.id)
          successCount++
        } catch (error) {
          console.error(`Failed to retry video for ${company.name}:`, error)
          errorCount++
        }
      }

      if (errorCount === 0) {
        toast.success(`Successfully queued ${successCount} video generation jobs`)
      } else {
        toast.warning(`Queued ${successCount} jobs, ${errorCount} failed`)
      }

      // Refresh data to see updated statuses
      fetchData()
    } catch (error) {
      toast.error("Failed to retry video jobs", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsRetryingVideos(false)
    }
  }

  // Auth screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter your API key to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAuthenticate()
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isAuthenticating}
                />
              </div>
              
              {authError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!apiKey || isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chocomotion Admin</h1>
            <p className="text-sm text-muted-foreground">Manage companies, employees, and videos</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaignIds.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Ready</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies.filter(c => c.videoStatus === "demo_finished" || c.videoStatus === "final").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Status */}
        {queueStatus && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Queue Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Enrichment Queue</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Waiting</span>
                      <Badge variant="secondary">{queueStatus.enrichment.waiting}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active</span>
                      <Badge variant="info">{queueStatus.enrichment.active}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <Badge variant="success">{queueStatus.enrichment.completed}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed</span>
                      <Badge variant="destructive">{queueStatus.enrichment.failed}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Video Generation Queue</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Waiting</span>
                      <Badge variant="secondary">{queueStatus.videoGeneration.waiting}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active</span>
                      <Badge variant="info">{queueStatus.videoGeneration.active}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <Badge variant="success">{queueStatus.videoGeneration.completed}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed</span>
                      <Badge variant="destructive">{queueStatus.videoGeneration.failed}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">
              <Building2 className="h-4 w-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <BarChart3 className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <CompaniesTable
              companies={companies}
              expandedCompanies={expandedCompanies}
              onToggleExpansion={toggleCompanyExpansion}
              getCompanyEmployees={getCompanyEmployees}
              onRetryEnrichment={handleRetryEnrichment}
              onRetryVideo={handleRetryVideo}
              onEditCompany={setEditingCompany}
              onDeleteCompany={handleDeleteCompany}
              onViewDemo={handleViewDemo}
              onAddEmployee={setAddingEmployeeToCompany}
              onDeleteEmployee={handleDeleteEmployee}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaigns Overview</CardTitle>
                <CardDescription>View video generation status by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={selectedCampaignId === "" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCampaignId("")}
                      >
                        All Campaigns
                      </Button>
                      {campaignIds.map(campaignId => (
                        <Button
                          key={campaignId}
                          variant={selectedCampaignId === campaignId ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCampaignId(campaignId)}
                        >
                          {campaignId}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkRetryVideos}
                        disabled={!selectedCampaignId || isRetryingVideos}
                      >
                        {isRetryingVideos ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Retry Videos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportDemoFinished}
                        disabled={!selectedCampaignId}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Demo Finished
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {selectedCampaignId && (
                    <CampaignStats 
                      companies={filteredCompanies} 
                      campaignId={selectedCampaignId} 
                    />
                  )}

                  <CompaniesTable
                    companies={filteredCompanies}
                    expandedCompanies={expandedCompanies}
                    onToggleExpansion={toggleCompanyExpansion}
                    getCompanyEmployees={getCompanyEmployees}
                    onRetryEnrichment={handleRetryEnrichment}
                    onRetryVideo={handleRetryVideo}
                    onEditCompany={setEditingCompany}
                    onDeleteCompany={handleDeleteCompany}
                    onViewDemo={handleViewDemo}
                    onAddEmployee={setAddingEmployeeToCompany}
                    onDeleteEmployee={handleDeleteEmployee}
                    isLoading={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Import Companies
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file to import companies in batches of 1000
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      setCsvImportType("companies")
                      setCsvImportOpen(true)
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Companies CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Import Employees
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file to import employees in batches of 1000
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => {
                      setCsvImportType("employees")
                      setCsvImportOpen(true)
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Employees CSV
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Sales Navigator Import
                  </CardTitle>
                  <CardDescription>
                    Import contacts from Sales Navigator. Companies are matched by website or auto-created.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setSalesNavImportOpen(true)}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Sales Navigator CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <CsvImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        type={csvImportType}
        onImportComplete={fetchData}
      />

      <SalesNavigatorImportDialog
        open={salesNavImportOpen}
        onOpenChange={setSalesNavImportOpen}
        onImportComplete={fetchData}
      />

      <CompanyEditDialog
        company={editingCompany}
        onClose={() => setEditingCompany(null)}
        onSave={fetchData}
      />

      <EmployeeAddDialog
        company={addingEmployeeToCompany}
        onClose={() => setAddingEmployeeToCompany(null)}
        onSave={fetchData}
      />
    </div>
  )
}

// Companies Table Component
interface CompaniesTableProps {
  companies: Company[]
  expandedCompanies: Set<string>
  onToggleExpansion: (id: string) => void
  getCompanyEmployees: (id: string) => Employee[]
  onRetryEnrichment: (company: Company) => void
  onRetryVideo: (company: Company) => void
  onEditCompany: (company: Company) => void
  onDeleteCompany: (company: Company) => void
  onViewDemo: (company: Company) => void
  onAddEmployee: (company: Company) => void
  onDeleteEmployee: (employee: Employee) => void
  isLoading: boolean
}

function CompaniesTable({
  companies,
  expandedCompanies,
  onToggleExpansion,
  getCompanyEmployees,
  onRetryEnrichment,
  onRetryVideo,
  onEditCompany,
  onDeleteCompany,
  onViewDemo,
  onAddEmployee,
  onDeleteEmployee,
  isLoading,
}: CompaniesTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No companies found
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Video Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const isExpanded = expandedCompanies.has(company.id)
            const companyEmployees = getCompanyEmployees(company.id)
            const statusConfig = VIDEO_STATUS_CONFIG[company.videoStatus as VideoStatus] || VIDEO_STATUS_CONFIG.none

            return (
              <React.Fragment key={company.id}>
                <TableRow className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onToggleExpansion(company.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {company.logoUrl ? (
                          <img 
                            src={company.logoUrl} 
                            alt={`${company.name} logo`}
                            className="h-8 w-8 rounded object-contain bg-muted"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span>{company.name}</span>
                      </div>
                    </TableCell>
                  <TableCell>
                    <a 
                      href={company.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {company.websiteUrl}
                    </a>
                  </TableCell>
                  <TableCell>{company.employees}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.campaignId}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDemo(company)}>
                          <Video className="h-4 w-4 mr-2" />
                          View Demo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRetryEnrichment(company)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Enrichment
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRetryVideo(company)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry Video
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAddEmployee(company)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditCompany(company)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteCompany(company)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={9} className="p-0">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-sm">
                            Employees ({companyEmployees.length})
                          </h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onAddEmployee(company)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Employee
                          </Button>
                        </div>
                        {companyEmployees.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>LinkedIn</TableHead>
                                <TableHead className="w-8"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {companyEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {employee.avatarUrl && (
                                        <img 
                                          src={employee.avatarUrl} 
                                          alt="" 
                                          className="h-8 w-8 rounded-full object-cover"
                                        />
                                      )}
                                      <span>{employee.firstName} {employee.lastName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{employee.jobTitle}</TableCell>
                                  <TableCell>
                                    <a 
                                      href={`mailto:${employee.email}`}
                                      className="text-blue-500 hover:underline"
                                    >
                                      {employee.email}
                                    </a>
                                  </TableCell>
                                  <TableCell>
                                    {employee.linkedinUrl && (
                                      <a 
                                        href={employee.linkedinUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        Profile
                                      </a>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => onDeleteEmployee(employee)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-sm text-muted-foreground">No employees found</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

// Campaign Stats Component
function CampaignStats({ companies, campaignId }: { companies: Company[], campaignId: string }) {
  const statusCounts = companies.reduce((acc, c) => {
    acc[c.videoStatus] = (acc[c.videoStatus] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const completed = (statusCounts.demo_finished || 0) + (statusCounts.final || 0)
  const total = companies.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card className="bg-muted/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{campaignId}</h3>
            <p className="text-sm text-muted-foreground">
              {completed} of {total} videos ready ({percentage}%)
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{percentage}%</div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
          {Object.entries(VIDEO_STATUS_CONFIG).map(([status, config]) => (
            <div key={status} className="text-center">
              <Badge variant={config.variant} className="mb-1">
                {statusCounts[status] || 0}
              </Badge>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
