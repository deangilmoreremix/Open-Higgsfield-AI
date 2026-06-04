"use client"

import { useState, useCallback, useRef } from "react"
import { api } from "@/lib/api"
import { COMPANY_FIELDS, EMPLOYEE_FIELDS } from "@/lib/types"
import type { CompanyInput, EmployeeInput } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CsvImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "companies" | "employees"
  onImportComplete: () => void
}

type ImportStep = "upload" | "mapping" | "preview" | "importing" | "complete"

const CHUNK_SIZE = 1000

export function CsvImportDialog({
  open,
  onOpenChange,
  type,
  onImportComplete,
}: CsvImportDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload")
  const [csvData, setCsvData] = useState<string[][]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fields = type === "companies" ? COMPANY_FIELDS : EMPLOYEE_FIELDS
  const requiredFields = fields.filter(f => f.required).map(f => f.value)

  const resetState = () => {
    setStep("upload")
    setCsvData([])
    setCsvHeaders([])
    setColumnMapping({})
    setImportProgress(0)
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

      // Auto-map columns with matching names
      const autoMapping: Record<string, string> = {}
      fields.forEach(field => {
        const matchingHeader = headers.find(
          h => h.toLowerCase().replace(/[_\s]/g, "") === field.value.toLowerCase()
        )
        if (matchingHeader) {
          autoMapping[field.value] = matchingHeader
        }
      })
      setColumnMapping(autoMapping)
      setStep("mapping")
    }
    reader.readAsText(file)
  }, [fields])

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

  const updateMapping = (targetField: string, csvColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [targetField]: csvColumn === "__none__" ? "" : csvColumn
    }))
  }

  const isValidMapping = () => {
    return requiredFields.every(field => columnMapping[field])
  }

  const getPreviewData = () => {
    return csvData.slice(0, 5).map(row => {
      const mapped: Record<string, string> = {}
      fields.forEach(field => {
        const csvColumn = columnMapping[field.value]
        if (csvColumn) {
          const colIndex = csvHeaders.indexOf(csvColumn)
          mapped[field.value] = colIndex >= 0 ? row[colIndex] || "" : ""
        } else {
          mapped[field.value] = ""
        }
      })
      return mapped
    })
  }

  const transformRowToData = (row: string[]): CompanyInput | EmployeeInput => {
    const data: Record<string, unknown> = {}
    
    fields.forEach(field => {
      const csvColumn = columnMapping[field.value]
      if (csvColumn) {
        const colIndex = csvHeaders.indexOf(csvColumn)
        const value = colIndex >= 0 ? row[colIndex] : ""
        
        // Handle number conversion for employees field
        if (field.value === "employees" && value) {
          data[field.value] = parseInt(value, 10) || 0
        } else {
          data[field.value] = value
        }
      }
    })

    return data as CompanyInput | EmployeeInput
  }

  const handleImport = async () => {
    setStep("importing")
    setImportProgress(0)

    const totalRows = csvData.length
    const chunks: string[][][] = []
    
    for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
      chunks.push(csvData.slice(i, i + CHUNK_SIZE))
    }

    const results = {
      total: totalRows,
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const items = chunk.map(transformRowToData)

      try {
        if (type === "companies") {
          await api.createCompanies(items as CompanyInput[])
        } else {
          await api.createEmployees(items as EmployeeInput[])
        }
        results.success += chunk.length
      } catch (error) {
        results.failed += chunk.length
        results.errors.push(
          `Chunk ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }

      setImportProgress(Math.round(((i + 1) / chunks.length) * 100))
    }

    setImportResults(results)
    setStep("complete")
    onImportComplete()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Import {type === "companies" ? "Companies" : "Employees"}
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file and map columns to import {type} in batches of {CHUNK_SIZE}
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
                Drag and drop your CSV file here
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse your files
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

          {/* Mapping Step */}
          {step === "mapping" && (
            <div className="space-y-4">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>CSV Loaded</AlertTitle>
                <AlertDescription>
                  Found {csvData.length} rows with {csvHeaders.length} columns. 
                  Map the columns below to import fields.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[300px]">
                <div className="space-y-4 pr-4">
                  {fields.map(field => (
                    <div key={field.value} className="flex items-center gap-4">
                      <Label className="w-40 text-right">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Select
                        value={columnMapping[field.value] || "__none__"}
                        onValueChange={(value) => updateMapping(field.value, value)}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">-- Not mapped --</SelectItem>
                          {csvHeaders.map(header => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Preview Step */}
          {step === "preview" && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Ready to Import</AlertTitle>
                <AlertDescription>
                  {csvData.length} rows will be imported in {Math.ceil(csvData.length / CHUNK_SIZE)} batch(es).
                  Preview the first 5 rows below.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {fields.map(field => (
                        <TableHead key={field.value}>{field.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getPreviewData().map((row, i) => (
                      <TableRow key={i}>
                        {fields.map(field => (
                          <TableCell key={field.value} className="max-w-[200px] truncate">
                            {row[field.value] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Importing Step */}
          {step === "importing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <h3 className="text-lg font-medium">Importing {type}...</h3>
              <p className="text-sm text-muted-foreground">
                Processing in batches of {CHUNK_SIZE}. Please do not close this dialog.
              </p>
              <Progress value={importProgress} className="max-w-md mx-auto" />
              <p className="text-sm font-medium">{importProgress}%</p>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && importResults && (
            <div className="space-y-4">
              {importResults.failed === 0 ? (
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Import Complete!</AlertTitle>
                  <AlertDescription>
                    Successfully imported {importResults.success} {type}.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Completed with Errors</AlertTitle>
                  <AlertDescription>
                    {importResults.success} succeeded, {importResults.failed} failed.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">{importResults.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                  <div className="text-sm text-muted-foreground">Success</div>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10">
                  <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
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
          
          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={() => setStep("preview")} disabled={!isValidMapping()}>
                Preview Import
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport}>
                Start Import ({csvData.length} rows)
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
