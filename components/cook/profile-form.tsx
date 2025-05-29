"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const addressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
});

const cookProfileFormSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: addressSchema,
  cuisineType: z.string().min(1, "Cuisine type is required"),
  certification: z.object({
    fssai: z.boolean().optional(),
    healthDepartment: z.boolean().optional(),
    foodSafetyTraining: z.boolean().optional(),
  }),
  aadhaar: z.string().min(12, "Valid Aadhaar number is required"),
  pan: z.string().min(10, "Valid PAN number is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type CookProfileFormValues = z.infer<typeof cookProfileFormSchema>;

export function CookProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<CookProfileFormValues>({
    resolver: zodResolver(cookProfileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      description: "",
      address: {
        street: "",
        city: "",
        state: "",
        pincode: "",
      },
      cuisineType: "",
      certification: {
        fssai: false,
        healthDepartment: false,
        foodSafetyTraining: false,
      },
      aadhaar: "",
      pan: "",
    },
  });

  // Fetch existing data if user is already a cook
  useEffect(() => {
    async function fetchCookProfile() {
      try {
        setIsLoading(true);

        // Get current user
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("Not authenticated");
        }

        // Check if user is already a cook
        const { data: cookData, error: cookError } = await supabase
          .from("cooks")
          .select("*")
          .eq("cook_id", session.user.id)
          .single();

        if (cookError && cookError.code !== "PGRST116") {
          // Not a "no rows" error
          throw cookError;
        }

        // Get user data for basic info
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError) throw userError;

        // Get cook profile data
        const { data: profileData, error: profileError } = cookData?.cook_id
          ? await supabase
              .from("cook_profiles")
              .select("*")
              .eq("cook_id", cookData.cook_id)
              .single()
          : { data: null, error: null };

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        // Populate form with existing data
        form.reset({
          first_name: cookData?.first_name || userData?.first_name || "",
          last_name: cookData?.last_name || userData?.last_name || "",
          email: cookData?.email || userData?.email || "",
          phone: cookData?.phone || userData?.phone || "",
          description: cookData?.description || "",
          address: cookData?.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
          cuisineType: profileData?.cuisine_type || "",
          certification: cookData?.certification || {
            fssai: false,
            healthDepartment: false,
            foodSafetyTraining: false,
          },
          aadhaar: profileData?.aadhaar || "",
          pan: profileData?.pan || "",
          latitude: cookData?.latitude || "",
          longitude: cookData?.longitude || "",
        });

        setProfileImage(cookData?.profile_image || null);
      } catch (error) {
        console.error("Error fetching cook profile:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCookProfile();
  }, [supabase, form]);

  async function onSubmit(data: CookProfileFormValues) {
    try {
      setIsSaving(true);

      // Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Not authenticated");
      }

      // Insert/update cook record
      const { data: cookData, error: cookError } = await supabase
        .from("cooks")
        .upsert(
          {
            cook_id: session.user.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            description: data.description,
            address: data.address,
            certification: data.certification,
            latitude: data.latitude,
            longitude: data.longitude,
            region: data.address.state, // Use state as region
            isAvailable: true, // Default to available
          },
          { onConflict: "cook_id" }
        )
        .select("id, cook_id")
        .single();

      if (cookError) throw cookError;

      // Insert/update cook profile
      const { error: profileError } = await supabase
        .from("cook_profiles")
        .upsert(
          {
            cook_id: cookData.cook_id,
            cuisine_type: data.cuisineType,
            aadhaar: data.aadhaar,
            pan: data.pan,
            verification_status: false, // Needs to be verified by admin
          },
          { onConflict: "cook_id" }
        );

      if (profileError) throw profileError;

      toast({
        title: "Profile saved",
        description: "Your cook profile has been saved successfully.",
      });

      // Redirect to cook dashboard after successful save
      router.push("/cook/dashboard");
    } catch (error) {
      console.error("Error saving cook profile:", error);
      toast({
        title: "Error saving profile",
        description: "There was a problem saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Handle profile image upload
  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `cook-images/${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      if (publicUrlData) {
        // Update cook profile with new image URL
        const { error: updateError } = await supabase
          .from("cooks")
          .update({ profile_image: publicUrlData.publicUrl })
          .eq("cook_id", session.user.id);

        if (updateError) throw updateError;

        setProfileImage(publicUrlData.publicUrl);

        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error uploading image",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Geocode address to get coordinates
  async function geocodeAddress() {
    try {
      const address = form.getValues("address");
      const addressString = [
        address.street,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      if (!addressString) return;

      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          addressString
        )}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`
      );

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        form.setValue("latitude", latitude.toString());
        form.setValue("longitude", longitude.toString());

        toast({
          title: "Address geocoded",
          description: "Your address has been successfully geocoded.",
        });
      } else {
        toast({
          title: "Geocoding failed",
          description:
            "Could not find coordinates for this address. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast({
        title: "Geocoding error",
        description: "There was a problem finding your location. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileImage || ""} alt="Profile" />
              <AvatarFallback>
                {form.getValues("first_name").charAt(0)}
                {form.getValues("last_name").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <label
                htmlFor="profile-image"
                className="cursor-pointer text-sm text-primary hover:underline"
              >
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
            <h2 className="text-xl font-semibold mb-2">Cook Profile Picture</h2>
            <p className="text-muted-foreground text-sm">
              Upload a clear profile picture to build trust with your customers.
              Recommended size: 400x400 pixels. Maximum size: 2MB.
            </p>
          </div>
        </div>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Your Food</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell customers about your cooking style, experience, and specialties."
                        className="resize-none min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your public profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cuisineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine Specialization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your cuisine specialty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="north_indian">North Indian</SelectItem>
                        <SelectItem value="south_indian">South Indian</SelectItem>
                        <SelectItem value="gujarati">Gujarati</SelectItem>
                        <SelectItem value="punjabi">Punjabi</SelectItem>
                        <SelectItem value="bengali">Bengali</SelectItem>
                        <SelectItem value="maharashtrian">Maharashtrian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="continental">Continental</SelectItem>
                        <SelectItem value="thai">Thai</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="middle_eastern">Middle Eastern</SelectItem>
                        <SelectItem value="desserts">Desserts & Baking</SelectItem>
                        <SelectItem value="healthy">Healthy & Diet</SelectItem>
                        <SelectItem value="mixed">Mixed Cuisine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the cuisine type you specialize in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={geocodeAddress}
                >
                  Find My Coordinates
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="19.0760" {...field} readOnly />
                      </FormControl>
                      <FormDescription>
                        Automatically filled by finding coordinates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="72.8777" {...field} readOnly />
                      </FormControl>
                      <FormDescription>
                        Automatically filled by finding coordinates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Food Safety Certifications</h3>
                <FormField
                  control={form.control}
                  name="certification.fssai"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>FSSAI Registration</FormLabel>
                        <FormDescription>
                          I have a valid FSSAI registration for home food business
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certification.healthDepartment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Health Department Certification</FormLabel>
                        <FormDescription>
                          I have a certification from the local health department
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certification.foodSafetyTraining"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Food Safety Training</FormLabel>
                        <FormDescription>
                          I have completed food safety training
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Identity Verification</h3>
                <FormField
                  control={form.control}
                  name="aadhaar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012" {...field} />
                      </FormControl>
                      <FormDescription>
                        Required for verification (will not be shared publicly)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCDE1234F" {...field} />
                      </FormControl>
                      <FormDescription>
                        Required for verification (will not be shared publicly)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving profile..." : "Save cook profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
