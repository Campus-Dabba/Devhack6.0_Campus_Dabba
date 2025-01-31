"use client"

import { useState } from "react"
import { CooksList } from "@/components/student/dashboard/cooks-list"
import { StatesFilter } from "@/components/student/dashboard/states-filter"
import { UserNav } from "@/components/student/dashboard/user-nav"

export function DashboardContent() {
  const [selectedState, setSelectedState] = useState("All States")

  return (
    <div className="flex min-h-screen">
      <main className="flex-1">
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Home-cooked Meals</h2>
              <p className="text-muted-foreground">
                Browse delicious home-cooked meals from verified cooks in your area
              </p>
            </div>
            <UserNav />
          </div>
          <StatesFilter selectedState={selectedState} onStateChange={setSelectedState} />
          <CooksList selectedState={selectedState} />
        </div>
      </main>
    </div>
  )
}

