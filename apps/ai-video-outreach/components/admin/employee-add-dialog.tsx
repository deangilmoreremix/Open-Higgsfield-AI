"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { Company } from "@/lib/types"
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
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface EmployeeAddDialogProps {
  company: Company | null
  onClose: () => void
  onSave: () => void
}

export function EmployeeAddDialog({ company, onClose, onSave }: EmployeeAddDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    avatarUrl: "",
    linkedinUrl: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        firstName: "",
        lastName: "",
        jobTitle: "",
        email: "",
        avatarUrl: "",
        linkedinUrl: "",
      })
    }
  }, [company])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.jobTitle.trim() &&
      formData.email.trim() &&
      formData.avatarUrl.trim() &&
      formData.linkedinUrl.trim()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company || !isValid()) return

    setIsSaving(true)
    try {
      await api.createEmployees([{
        companyId: company.id,
        ...formData,
      }])
      toast.success("Employee added successfully")
      onSave()
      onClose()
    } catch (error) {
      toast.error("Failed to add employee", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={!!company} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to {company?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              placeholder="e.g. VP of Sales"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL *</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => handleChange("avatarUrl", e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL *</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => handleChange("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isValid()}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
