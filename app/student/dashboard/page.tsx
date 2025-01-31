import type { Metadata } from "next"
import { DashboardContent } from "@/components/student/dashboard/dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Browse home-cooked meals from cooks in your area",
}

export default function DashboardPage() {
  return <DashboardContent />
}

