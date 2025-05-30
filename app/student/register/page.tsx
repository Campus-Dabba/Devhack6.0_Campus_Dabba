import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { StudentRegistrationForm } from "@/components/student/registration-form"

export const metadata: Metadata = {
  title: "Student Registration",
  description: "Register as a student to order homemade food",
}

export default function StudentRegistrationPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image src="/logo.svg" alt="Logo" width={40} height={40} className="mr-2" />
          FoodConnect
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "As a student, finding good homemade food was always a challenge. FoodConnect made it super easy to get
              delicious meals from local home cooks!"
            </p>
            <footer className="text-sm">John, Engineering Student</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create your student account</h1>
            <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
          </div>
          <StudentRegistrationForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/student/login" className="underline underline-offset-4 hover:text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

