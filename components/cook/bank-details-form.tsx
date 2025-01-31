"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import type { BankDetails } from "@/types/student"

const formSchema = z
  .object({
    accountHolderName: z.string().min(2, {
      message: "Account holder name must be at least 2 characters.",
    }),
    accountNumber: z.string().min(8, {
      message: "Please enter a valid account number.",
    }),
    confirmAccountNumber: z.string().min(8, {
      message: "Please confirm your account number.",
    }),
    ifscCode: z.string().min(11).max(11, {
      message: "IFSC code must be exactly 11 characters.",
    }),
    bankName: z.string().min(2, {
      message: "Please enter your bank name.",
    }),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  })

interface BankDetailsFormProps {
  onSuccess?: (details: BankDetails) => void
}

export function BankDetailsForm({ onSuccess }: BankDetailsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Here we would typically make an API call to save bank details
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const bankDetails: BankDetails = {
        id: Math.random().toString(),
        userId: "current-user-id",
        accountHolderName: values.accountHolderName,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode,
        bankName: values.bankName,
        isVerified: false,
      }

      toast({
        title: "Bank details saved!",
        description: "Your bank details have been saved successfully.",
      })

      onSuccess?.(bankDetails)
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="accountHolderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Enter the name exactly as it appears on your bank account</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your account number" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Account Number</FormLabel>
              <FormControl>
                <Input placeholder="Confirm your account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ifscCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IFSC Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="SBIN0123456"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>You can find this code on your cheque book or bank statement</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="State Bank of India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Bank Details
        </Button>
      </form>
    </Form>
  )
}

