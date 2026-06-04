import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { Toaster } from "@/components/ui/sonner"

export default function AdminPage() {
  return (
    <>
      <AdminDashboard />
      <Toaster position="top-right" richColors />
    </>
  )
}
