"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token")
        if (!token) {
          throw new Error("No verification token found")
        }

        const response = await fetch(`/api/verify-email?token_hash=${token}&type=email&next=/`)
        if (response.ok) {
          toast({
            title: "Email verified successfully!",
            description: "You can now login to your account.",
          })
          router.push("/")
        } else {
          throw new Error("Verification failed")
        }
      } catch (error) {
        toast({
          title: "Verification failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      {isVerifying ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Please check your email for the verification link.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}