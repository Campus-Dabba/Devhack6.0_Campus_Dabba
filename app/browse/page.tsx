import type { Metadata } from "next"
import { CooksList } from "@/components/student/dashboard/cooks-list"
import { StatesFilter } from "@/components/student/dashboard/states-filter"

export const metadata: Metadata = {
  title: "Browse Cooks",
  description: "Find and explore home cooks in your area",
}

export default function BrowseCooksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Cooks</h1>
        <p className="text-muted-foreground">Discover talented home cooks and their delicious offerings</p>
      </div>
      <StatesFilter />
      <CooksList />
    </div>
  )
}

