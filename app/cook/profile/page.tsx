import type { Metadata } from "next"

import { CookProfileForm } from "@/components/cook/profile-form"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Profile Setup",
  description: "Complete your profile to start accepting orders",
}

export default function CookProfilePage() {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Complete your profile to start accepting orders</p>
      </div>
      <Separator />
      <CookProfileForm />
    </div>
  )
}

