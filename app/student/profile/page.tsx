import type { Metadata } from "next"
import { ProfileForm } from "@/components/student/profile/profile-form"

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your student profile",
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>
      <ProfileForm />
    </div>
  )
}

