"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import type { Company, VideoStatus } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface CompanyEditDialogProps {
  company: Company | null
  onClose: () => void
  onSave: () => void
}

const VIDEO_STATUSES: { value: VideoStatus; label: string }[] = [
  { value: "none", label: "None" },
  { value: "demo_scheduled", label: "Demo Scheduled" },
  { value: "demo_started", label: "Demo Started" },
  { value: "demo_finished", label: "Demo Finished" },
  { value: "final_progress", label: "Final In Progress" },
  { value: "final", label: "Final" },
]

export function CompanyEditDialog({ company, onClose, onSave }: CompanyEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    campaignId: "",
    industry: "",
    employees: 0,
    primaryColor: "",
    secondaryColor: "",
    fontFamily: "",
    logoUrl: "",
    valueProp: "",
    targetAudience: "",
    voiceTone: "",
    videoStatus: "none" as VideoStatus,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        websiteUrl: company.websiteUrl || "",
        campaignId: company.campaignId || "",
        industry: company.industry || "",
        employees: company.employees || 0,
        primaryColor: company.primaryColor || "",
        secondaryColor: company.secondaryColor || "",
        fontFamily: company.fontFamily || "",
        logoUrl: company.logoUrl || "",
        valueProp: company.valueProp || "",
        targetAudience: company.targetAudience || "",
        voiceTone: company.voiceTone || "",
        videoStatus: company.videoStatus || "none",
      })
    }
  }, [company])

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setIsSaving(true)
    try {
      await api.updateCompany(company.id, formData)
      toast.success("Company updated successfully")
      onSave()
      onClose()
    } catch (error) {
      toast.error("Failed to update company", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={!!company} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company details for {company?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleChange("websiteUrl", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignId">Campaign ID *</Label>
                  <Input
                    id="campaignId"
                    value={formData.campaignId}
                    onChange={(e) => handleChange("campaignId", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    value={formData.employees}
                    onChange={(e) => handleChange("employees", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoStatus">Video Status</Label>
                  <Select
                    value={formData.videoStatus}
                    onValueChange={(value) => handleChange("videoStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Branding */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Branding</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        value={formData.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                        placeholder="#000000"
                      />
                      {formData.primaryColor && (
                        <div 
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: formData.primaryColor }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        value={formData.secondaryColor}
                        onChange={(e) => handleChange("secondaryColor", e.target.value)}
                        placeholder="#ffffff"
                      />
                      {formData.secondaryColor && (
                        <div 
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: formData.secondaryColor }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Input
                      id="fontFamily"
                      value={formData.fontFamily}
                      onChange={(e) => handleChange("fontFamily", e.target.value)}
                      placeholder="Inter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => handleChange("logoUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Content</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valueProp">Value Proposition</Label>
                    <Textarea
                      id="valueProp"
                      value={formData.valueProp}
                      onChange={(e) => handleChange("valueProp", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => handleChange("targetAudience", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voiceTone">Voice & Tone</Label>
                    <Input
                      id="voiceTone"
                      value={formData.voiceTone}
                      onChange={(e) => handleChange("voiceTone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
