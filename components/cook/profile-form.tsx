"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { MapPreview } from "@/components/map/map-preview"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { CuisineType } from "@/types"

const formSchema = z.object({
  address: z.string().min(10, {
    message: "Address must be at least 10 characters.",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cuisineType: z.string(),
  bio: z.string().min(50, {
    message: "Bio must be at least 50 characters.",
  }),
  certification: z.string().optional(),
})

export function CookProfileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedAddress, setDebouncedAddress] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      latitude: undefined,
      longitude: undefined,
      cuisineType: "indian",
      bio: "",
    },
  })

  const watchAddress = form.watch("address")

  // Update debounced address
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAddress(watchAddress)
    }, 1000)

    return () => clearTimeout(timer)
  }, [watchAddress])

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue("latitude", lat)
    form.setValue("longitude", lng)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Here we would typically make an API call to update the profile
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      })

      router.push("/cook/dashboard")
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your complete address" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={() => (
            <MapPreview
              address={debouncedAddress}
              latitude={form.getValues("latitude")}
              longitude={form.getValues("longitude")}
              onLocationSelect={handleLocationSelect}
            />
          )}
        />

        <FormField
          control={form.control}
          name="cuisineType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuisine Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary cuisine type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="continental">Continental</SelectItem>
                  <SelectItem value="maharashtrian">Maharashtrian</SelectItem>
                  <SelectItem value="keralian">Keralian</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your cooking experience and specialties"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>This will be displayed to students when they view your profile</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cooking Certification</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    id="certification"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        field.onChange(file.name)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      document.getElementById("certification")?.click()
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Certificate
                  </Button>
                  {field.value && <span className="text-sm">{field.value}</span>}
                </div>
              </FormControl>
              <FormDescription>Upload any cooking certifications you may have (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </Form>
  )
}

