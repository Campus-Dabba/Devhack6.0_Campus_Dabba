"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createClient } from "@/utils/supabase/client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const profileFormSchema = z.object({
  first_name: z
    .string()
    .min(2, {
      message: "First name must be at least 2 characters.",
    })
    .max(30, {
      message: "First name must not be longer than 30 characters.",
    }),
  last_name: z
    .string()
    .min(2, {
      message: "Last name must be at least 2 characters.",
    })
    .max(30, {
      message: "Last name must not be longer than 30 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }).optional().or(z.literal('')),
  bio: z.string().max(160).min(4).optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(2, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().min(6, "Valid pincode is required"),
  })
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = createClient()
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      bio: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: ""
      }
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          throw new Error("Authentication error: " + sessionError.message)
        }
        
        if (!session?.user) {
          throw new Error("Not authenticated - please log in")
        }
        
        // Fetch user data from auth.users for email
        const { data: authData, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error("Auth data error:", authError)
          throw authError
        }
        
        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(`
            id,
            email,
            first_name,
            last_name,
            phone,
            role,
            created_at,
            profile_image,
            address,
            user_preferences
          `)
          .eq("id", session.user.id)
          .single()
        
        if (userError) {
          console.error("User data error:", userError)
          // Don't throw for PGRST116 (no rows), we'll create a new user record
          if (userError.code !== "PGRST116") {
            throw userError
          }
        }
        
        // Combine data from auth and DB
        const combinedData = {
          first_name: userData?.first_name || "",
          last_name: userData?.last_name || "",
          email: userData?.email || authData.user?.email || "",
          phone: userData?.phone || "",
          bio: userData?.user_preferences?.bio || "",
          address: userData?.address || {
            street: "",
            city: "",
            state: "",
            pincode: ""
          },
          profile_image: userData?.profile_image
        }
        
        // Update form with user data
        form.reset({
          first_name: combinedData.first_name,
          last_name: combinedData.last_name,
          email: combinedData.email,
          phone: combinedData.phone,
          bio: combinedData.bio,
          address: {
            street: combinedData.address?.street || "",
            city: combinedData.address?.city || "",
            state: combinedData.address?.state || "",
            pincode: combinedData.address?.pincode || ""
          }
        })
        
        // Set profile image if available
        setProfileImage(combinedData.profile_image || null)
        
      } catch (error) {
        console.error("Error fetching profile:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError("Failed to load profile: " + errorMessage)
        
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [supabase, form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSaving(true)
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error("Not authenticated")
      }
      
      // Prepare user data
      const userData = {
        id: session.user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        user_preferences: {
          bio: data.bio
        },
        address: data.address,
        updated_at: new Date().toISOString()
      }
      
      // Use upsert to handle both insert and update cases
      const { error: upsertError } = await supabase
        .from("users")
        .upsert(userData, {
          onConflict: 'id'
        })
      
      if (upsertError) {
        throw new Error(`Failed to save profile: ${upsertError.message}`)
      }
      
      // Update auth email if changed and different from auth email
      const { data: authUser } = await supabase.auth.getUser()
      if (data.email !== authUser.user?.email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: data.email
        })
        
        if (emailUpdateError) {
          // Don't fail the whole operation for this
          toast({
            title: "Email update pending",
            description: "Your profile was updated, but changing your email requires verification.",
          })
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      toast({
        title: "Error updating profile",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle profile image upload
  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive"
        })
        return
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      
      console.log("Uploading image")
      
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `profile-images/${session.user.id}-${Date.now()}.${fileExt}`
      
      // Make sure bucket exists and is accessible
      try {
        // Test bucket access
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('profile-images')
        
        if (bucketError) {
          // Bucket doesn't exist or is not accessible
          console.log("Bucket error, attempting to create:", bucketError)
          const { data, error } = await supabase.storage.createBucket('profile-images', {
            public: true
          })
          
          if (error) throw error
        }
      } catch (e) {
        console.error("Error with storage bucket:", e)
        // Continue anyway, it might work
      }
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })
        
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath)
        
      if (publicUrlData) {
        console.log("Image uploaded successfully:", publicUrlData.publicUrl)
        
        // Update user profile with new image URL
        const { data: checkUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle()
        
        if (!checkUser) {
          // User record doesn't exist, create it
          const { error: insertError } = await supabase
            .from("users")
            .insert({
              id: session.user.id,
              profile_image: publicUrlData.publicUrl,
              created_at: new Date().toISOString(),
              first_name: form.getValues("first_name") || "",
              last_name: form.getValues("last_name") || "",
              email: form.getValues("email") || ""
            })
          
          if (insertError) throw insertError
        } else {
          // Update existing user
          const { error: updateError } = await supabase
            .from("users")
            .update({ profile_image: publicUrlData.publicUrl })
            .eq("id", session.user.id)
            
          if (updateError) throw updateError
        }
        
        setProfileImage(publicUrlData.publicUrl)
        
        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully."
        })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error uploading image",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading profile</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            className="mt-2 ml-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Debugging section - for development only */}
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle>Debug Info</AlertTitle>
          <AlertDescription className="max-h-32 overflow-auto">
            <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileImage || ""} alt="Profile" />
              <AvatarFallback>{form.getValues("first_name")?.charAt(0) || '?'}{form.getValues("last_name")?.charAt(0) || ''}</AvatarFallback>
            </Avatar>
            <div>
              <label htmlFor="profile-image" className="cursor-pointer text-sm text-primary hover:underline">
                Change profile picture
                <input 
                  id="profile-image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Profile Picture</h2>
            <p className="text-muted-foreground text-sm">
              Upload a profile picture to personalize your account.
              Recommended size: 400x400 pixels. Maximum size: 2MB.
            </p>
          </div>
        </div>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@example.com" {...field} />
                  </FormControl>
                  <FormDescription>This is your email address for notifications.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormDescription>This helps cooks contact you for deliveries.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us a little bit about yourself, your food preferences, allergies, etc." 
                    className="resize-none min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  This helps cooks understand your preferences better.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="border p-4 rounded-lg space-y-6">
            <h3 className="font-medium text-lg">Address Information</h3>
            
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Apt 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address.pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input placeholder="400001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving changes..." : "Save changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

