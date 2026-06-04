"use client"

import { useState, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import type { Company, CompanyInput, EmployeeInput } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Users, Building2 } from "lucide-react"
import { toast } from "sonner"

interface SalesNavigatorImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

type ImportStep = "upload" | "config" | "preview" | "importing" | "complete"

// Sales Navigator CSV column names
const SALES_NAV_COLUMNS = {
  firstName: "First Name",
  lastName: "Last Name",
  title: "Title",
  companyName: "Company Name",
  companyNameForEmails: "Company Name for Emails",
  email: "Email",
  emailStatus: "Email Status",
  employees: "# Employees",
  industry: "Industry",
  personLinkedinUrl: "Person Linkedin Url",
  website: "Website",
  companyLinkedinUrl: "Company Linkedin Url",
  facebookUrl: "Facebook Url",
  twitterUrl: "Twitter Url",
  city: "City",
  state: "State",
  country: "Country",
  companyAddress: "Company Address",
  companyCity: "Company City",
  companyState: "Company State",
  companyCountry: "Company Country",
  companyPhone: "Company Phone",
  technologies: "Technologies",
  annualRevenue: "Annual Revenue",
  totalFunding: "Total Funding",
  latestFunding: "Latest Funding",
  latestFundingAmount: "Latest Funding Amount",
  lastRaisedAt: "Last Raised At",
  subsidiaryOf: "Subsidiary of",
  emailSent: "Email Sent",
} as const

interface ParsedContact {
  firstName: string
  lastName: string
  jobTitle: string
  email: string
  linkedinUrl: string
  companyName: string
  companyWebsite: string
  companyIndustry: string
  companyEmployees: number
  rowIndex: number
}

interface ImportResults {
  totalContacts: number
  companiesCreated: number
  companiesExisting: number
  employeesCreated: number
  employeesSkippedDuplicate: number
  skippedRows: number
  errors: string[]
}

export function SalesNavigatorImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: SalesNavigatorImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload")
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<string[][]>([])
  const [campaignId, setCampaignId] = useState("")
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [skippedRows, setSkippedRows] = useState<{ row: number; reason: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState("")
  const [importResults, setImportResults] = useState<ImportResults | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setStep("upload")
    setCsvHeaders([])
    setCsvData([])
    setCampaignId("")
    setParsedContacts([])
    setSkippedRows([])
    setImportProgress(0)
    setImportStatus("")
    setImportResults(null)
  }

  const handleClose = () => {
    resetState()
    onOpenChange(false)
  }

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = []
    let currentLine: string[] = []
    let currentField = ""
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentField += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          currentField += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ",") {
          currentLine.push(currentField.trim())
          currentField = ""
        } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
          currentLine.push(currentField.trim())
          if (currentLine.some(f => f !== "")) {
            lines.push(currentLine)
          }
          currentLine = []
          currentField = ""
          if (char === "\r") i++
        } else if (char !== "\r") {
          currentField += char
        }
      }
    }

    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField.trim())
      if (currentLine.some(f => f !== "")) {
        lines.push(currentLine)
      }
    }

    return lines
  }

  const getColumnIndex = (headers: string[], columnName: string): number => {
    return headers.findIndex(h => h.toLowerCase().trim() === columnName.toLowerCase().trim())
  }

  const normalizeWebsite = (url: string): string => {
    if (!url) return ""
    let normalized = url.toLowerCase().trim()
    // Remove protocol
    normalized = normalized.replace(/^https?:\/\//, "")
    // Remove www.
    normalized = normalized.replace(/^www\./, "")
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, "")
    return normalized
  }

  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)

      if (parsed.length < 2) {
        toast.error("CSV must have at least a header row and one data row")
        return
      }

      const headers = parsed[0]
      const data = parsed.slice(1)

      setCsvHeaders(headers)
      setCsvData(data)
      setStep("config")
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const parseContacts = () => {
    const contacts: ParsedContact[] = []
    const skipped: { row: number; reason: string }[] = []

    const colIndexes = {
      firstName: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.firstName),
      lastName: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.lastName),
      title: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.title),
      email: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.email),
      personLinkedinUrl: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.personLinkedinUrl),
      companyName: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.companyName),
      website: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.website),
      industry: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.industry),
      employees: getColumnIndex(csvHeaders, SALES_NAV_COLUMNS.employees),
    }

    csvData.forEach((row, index) => {
      const firstName = colIndexes.firstName >= 0 ? row[colIndexes.firstName]?.trim() || "" : ""
      const lastName = colIndexes.lastName >= 0 ? row[colIndexes.lastName]?.trim() || "" : ""
      const jobTitle = colIndexes.title >= 0 ? row[colIndexes.title]?.trim() || "" : ""
      const email = colIndexes.email >= 0 ? row[colIndexes.email]?.trim() || "" : ""
      const linkedinUrl = colIndexes.personLinkedinUrl >= 0 ? row[colIndexes.personLinkedinUrl]?.trim() || "" : ""
      const companyName = colIndexes.companyName >= 0 ? row[colIndexes.companyName]?.trim() || "" : ""
      const companyWebsite = colIndexes.website >= 0 ? row[colIndexes.website]?.trim() || "" : ""
      const companyIndustry = colIndexes.industry >= 0 ? row[colIndexes.industry]?.trim() || "" : ""
      const employeesStr = colIndexes.employees >= 0 ? row[colIndexes.employees]?.trim() || "0" : "0"
      const companyEmployees = parseInt(employeesStr.replace(/[^0-9]/g, ""), 10) || 0

      // Validate required fields
      const missingFields: string[] = []
      if (!firstName) missingFields.push("First Name")
      if (!lastName) missingFields.push("Last Name")
      if (!jobTitle) missingFields.push("Title")
      if (!email) missingFields.push("Email")
      if (!companyName) missingFields.push("Company Name")
      if (!companyWebsite) missingFields.push("Website")
      if (!companyIndustry) missingFields.push("Industry")

      if (missingFields.length > 0) {
        skipped.push({
          row: index + 2, // +2 because of 0-index and header row
          reason: `Missing required fields: ${missingFields.join(", ")}`,
        })
        return
      }

      contacts.push({
        firstName,
        lastName,
        jobTitle,
        email,
        linkedinUrl,
        companyName,
        companyWebsite,
        companyIndustry,
        companyEmployees,
        rowIndex: index + 2,
      })
    })

    setParsedContacts(contacts)
    setSkippedRows(skipped)
    setStep("preview")
  }

  const getUniqueCompanies = () => {
    const companyMap = new Map<string, ParsedContact>()
    parsedContacts.forEach(contact => {
      const normalizedWebsite = normalizeWebsite(contact.companyWebsite)
      if (!companyMap.has(normalizedWebsite)) {
        companyMap.set(normalizedWebsite, contact)
      }
    })
    return Array.from(companyMap.values())
  }

  const handleImport = async () => {
    setStep("importing")
    setImportProgress(0)
    setImportStatus("Fetching existing companies...")

    const results: ImportResults = {
      totalContacts: parsedContacts.length,
      companiesCreated: 0,
      companiesExisting: 0,
      employeesCreated: 0,
      employeesSkippedDuplicate: 0,
      skippedRows: skippedRows.length,
      errors: [...skippedRows.map(s => `Row ${s.row}: ${s.reason}`)],
    }

    try {
      // Step 1: Fetch all existing companies and employees
      setImportStatus("Fetching existing data...")
      const [existingCompanies, existingEmployees] = await Promise.all([
        api.getCompanies(),
        api.getEmployees(),
      ])
      setImportProgress(10)

      // Create a Set of existing employee emails (normalized to lowercase)
      const existingEmails = new Set(
        existingEmployees.map(e => e.email.toLowerCase().trim())
      )

      // Create a map of normalized website -> company
      const existingCompanyMap = new Map<string, Company>()
      existingCompanies.forEach(company => {
        const normalizedWebsite = normalizeWebsite(company.websiteUrl)
        if (normalizedWebsite) {
          existingCompanyMap.set(normalizedWebsite, company)
        }
      })

      // Step 2: Identify companies to create
      setImportStatus("Identifying new companies...")
      const uniqueCompanies = getUniqueCompanies()
      const companiesToCreate: CompanyInput[] = []
      const websiteToCompanyId = new Map<string, string>()

      uniqueCompanies.forEach(contact => {
        const normalizedWebsite = normalizeWebsite(contact.companyWebsite)
        const existingCompany = existingCompanyMap.get(normalizedWebsite)

        if (existingCompany) {
          websiteToCompanyId.set(normalizedWebsite, existingCompany.id)
          results.companiesExisting++
        } else {
          companiesToCreate.push({
            name: contact.companyName,
            websiteUrl: contact.companyWebsite,
            industry: contact.companyIndustry,
            employees: contact.companyEmployees,
            campaignId: campaignId,
          })
        }
      })

      setImportProgress(20)

      // Step 3: Create missing companies in batches
      if (companiesToCreate.length > 0) {
        setImportStatus(`Creating ${companiesToCreate.length} new companies...`)
        const BATCH_SIZE = 100
        const companyBatches: CompanyInput[][] = []

        for (let i = 0; i < companiesToCreate.length; i += BATCH_SIZE) {
          companyBatches.push(companiesToCreate.slice(i, i + BATCH_SIZE))
        }

        for (let i = 0; i < companyBatches.length; i++) {
          try {
            const createdCompanies = await api.createCompanies(companyBatches[i])
            createdCompanies.forEach(company => {
              const normalizedWebsite = normalizeWebsite(company.websiteUrl)
              websiteToCompanyId.set(normalizedWebsite, company.id)
              results.companiesCreated++
            })
          } catch (error) {
            results.errors.push(
              `Failed to create company batch ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          }

          setImportProgress(20 + Math.round(((i + 1) / companyBatches.length) * 30))
        }
      }

      // Step 4: Create employees (skip duplicates by email)
      setImportStatus("Creating employees...")
      const employeesToCreate: EmployeeInput[] = []
      const employeeErrors: string[] = []

      parsedContacts.forEach(contact => {
        const normalizedWebsite = normalizeWebsite(contact.companyWebsite)
        const companyId = websiteToCompanyId.get(normalizedWebsite)

        if (!companyId) {
          employeeErrors.push(`Row ${contact.rowIndex}: Could not find or create company for ${contact.companyName}`)
          return
        }

        // Check for duplicate email
        const normalizedEmail = contact.email.toLowerCase().trim()
        if (existingEmails.has(normalizedEmail)) {
          results.employeesSkippedDuplicate++
          return
        }

        // Add to existingEmails to prevent duplicates within the same import
        existingEmails.add(normalizedEmail)

        employeesToCreate.push({
          companyId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          jobTitle: contact.jobTitle,
          email: contact.email,
          avatarUrl: "", // Not available in Sales Navigator export
          linkedinUrl: contact.linkedinUrl,
        })
      })

      results.errors.push(...employeeErrors)
      setImportProgress(55)

      // Create employees in batches
      if (employeesToCreate.length > 0) {
        const BATCH_SIZE = 100
        const employeeBatches: EmployeeInput[][] = []

        for (let i = 0; i < employeesToCreate.length; i += BATCH_SIZE) {
          employeeBatches.push(employeesToCreate.slice(i, i + BATCH_SIZE))
        }

        for (let i = 0; i < employeeBatches.length; i++) {
          try {
            const created = await api.createEmployees(employeeBatches[i])
            results.employeesCreated += created.length
          } catch (error) {
            results.errors.push(
              `Failed to create employee batch ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
            )
          }

          setImportProgress(55 + Math.round(((i + 1) / employeeBatches.length) * 45))
        }
      }

      setImportResults(results)
      setStep("complete")
      onImportComplete()
    } catch (error) {
      results.errors.push(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setImportResults(results)
      setStep("complete")
    }
  }

  const uniqueCompaniesCount = getUniqueCompanies().length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Sales Navigator Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV export from Sales Navigator. Companies will be matched by website URL or created if not found.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Upload Step */}
          {step === "upload" && (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                Drag and drop your Sales Navigator CSV export
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Export your leads from Sales Navigator and upload the CSV file
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          )}

          {/* Config Step */}
          {step === "config" && (
            <div className="space-y-6">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>CSV Loaded</AlertTitle>
                <AlertDescription>
                  Found {csvData.length} contacts with {csvHeaders.length} columns.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignId" className="text-base font-medium">
                    Campaign ID <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    All new companies will be assigned to this campaign
                  </p>
                  <Input
                    id="campaignId"
                    placeholder="e.g., sales-q1-2026"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                  />
                </div>

                <div className="rounded-lg border p-4 bg-muted/30">
                  <h4 className="font-medium mb-3">Expected CSV Columns</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries({
                      "First Name": csvHeaders.includes("First Name") || csvHeaders.some(h => h.toLowerCase() === "first name"),
                      "Last Name": csvHeaders.includes("Last Name") || csvHeaders.some(h => h.toLowerCase() === "last name"),
                      "Title": csvHeaders.includes("Title") || csvHeaders.some(h => h.toLowerCase() === "title"),
                      "Email": csvHeaders.includes("Email") || csvHeaders.some(h => h.toLowerCase() === "email"),
                      "Company Name": csvHeaders.includes("Company Name") || csvHeaders.some(h => h.toLowerCase() === "company name"),
                      "Website": csvHeaders.includes("Website") || csvHeaders.some(h => h.toLowerCase() === "website"),
                      "Industry": csvHeaders.includes("Industry") || csvHeaders.some(h => h.toLowerCase() === "industry"),
                      "# Employees": csvHeaders.includes("# Employees") || csvHeaders.some(h => h.toLowerCase() === "# employees"),
                      "Person Linkedin Url": csvHeaders.includes("Person Linkedin Url") || csvHeaders.some(h => h.toLowerCase() === "person linkedin url"),
                    }).map(([col, found]) => (
                      <div key={col} className="flex items-center gap-2">
                        {found ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className={found ? "" : "text-muted-foreground"}>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertTitle>Contacts to Import</AlertTitle>
                  <AlertDescription>
                    {parsedContacts.length} valid contacts found
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertTitle>Unique Companies</AlertTitle>
                  <AlertDescription>
                    {uniqueCompaniesCount} companies identified by website
                  </AlertDescription>
                </Alert>
              </div>

              {skippedRows.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{skippedRows.length} Rows Skipped</AlertTitle>
                  <AlertDescription>
                    These rows are missing required data and will not be imported.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Preview (first 10 contacts)</h4>
                <ScrollArea className="h-[250px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Website</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedContacts.slice(0, 10).map((contact, i) => (
                        <TableRow key={i}>
                          <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{contact.jobTitle}</TableCell>
                          <TableCell className="max-w-[180px] truncate">{contact.email}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{contact.companyName}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{contact.companyWebsite}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {skippedRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Skipped Rows</h4>
                  <ScrollArea className="h-[100px] border border-destructive/20 rounded-lg p-3">
                    <div className="space-y-1 text-sm">
                      {skippedRows.slice(0, 20).map((skip, i) => (
                        <p key={i} className="text-muted-foreground">
                          <span className="font-medium">Row {skip.row}:</span> {skip.reason}
                        </p>
                      ))}
                      {skippedRows.length > 20 && (
                        <p className="text-muted-foreground italic">
                          ... and {skippedRows.length - 20} more
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Importing Step */}
          {step === "importing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <h3 className="text-lg font-medium">Importing contacts...</h3>
              <p className="text-sm text-muted-foreground">{importStatus}</p>
              <Progress value={importProgress} className="max-w-md mx-auto" />
              <p className="text-sm font-medium">{importProgress}%</p>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && importResults && (
            <div className="space-y-4">
              {importResults.errors.length === 0 ? (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Import Complete!</AlertTitle>
                  <AlertDescription>
                    Successfully imported {importResults.employeesCreated} contacts.
                    {importResults.employeesSkippedDuplicate > 0 && (
                      <> {importResults.employeesSkippedDuplicate} duplicates were skipped (email already exists).</>
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant={importResults.employeesCreated > 0 ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Completed with Issues</AlertTitle>
                  <AlertDescription>
                    {importResults.employeesCreated} contacts imported, {importResults.errors.length} issues encountered.
                    {importResults.employeesSkippedDuplicate > 0 && (
                      <> {importResults.employeesSkippedDuplicate} duplicates skipped.</>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{importResults.totalContacts}</div>
                  <div className="text-sm text-muted-foreground">Total Contacts</div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-600">{importResults.employeesCreated}</div>
                  <div className="text-sm text-muted-foreground">Employees Created</div>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <div className="text-2xl font-bold text-blue-600">{importResults.companiesCreated}</div>
                  <div className="text-sm text-muted-foreground">New Companies</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10">
                  <div className="text-2xl font-bold text-amber-600">{importResults.companiesExisting}</div>
                  <div className="text-sm text-muted-foreground">Existing Companies</div>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10">
                  <div className="text-2xl font-bold text-purple-600">{importResults.employeesSkippedDuplicate}</div>
                  <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <ScrollArea className="h-[150px] border rounded-lg p-4">
                  <div className="space-y-2">
                    {importResults.errors.map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}

          {step === "config" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={parseContacts} disabled={!campaignId.trim()}>
                Continue
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("config")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={parsedContacts.length === 0}>
                Import {parsedContacts.length} Contacts
              </Button>
            </>
          )}

          {step === "complete" && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

