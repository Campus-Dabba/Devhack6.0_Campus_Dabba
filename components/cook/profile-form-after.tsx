"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { MapPreview } from "@/components/map/map-preview";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode required"),
  password: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  profile_image: z.string().optional(),
  cuisineType: z.string(),
  description: z.string().min(50, {
    message: "Bio must be at least 50 characters.",
  }),
  certification: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        date: z.string(),
        url: z.string().optional(),
      })
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function CookProfileForm() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const [debouncedAddress, setDebouncedAddress] = useState("");
  const [certifications, setCertifications] = useState<
    FormValues["certification"]
  >([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      cuisineType: "",
      description: "",
      certification: [],
    },
  });
  useEffect(() => {
    fetchCookData();
  }, []);

  const fetchCookData = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: cookData, error: cookError } = await supabase
          .from("cooks")
          .select("*")
          .eq("cook_id", authUser.id)
          .single();

        if (cookError) throw cookError;

        if (cookData) {
          form.setValue("first_name", cookData.first_name || "");
          form.setValue("last_name", cookData.last_name || "");
          form.setValue("email", cookData.email || "");
          form.setValue("phone", cookData.phone || "");
          
          // Handle address properly - it might be a JSON object or individual fields
          const address = cookData.address || {};
          form.setValue("street", address.street || cookData.street || "");
          form.setValue("city", address.city || cookData.city || "");
          form.setValue("state", address.state || cookData.state || "");
          form.setValue("pincode", address.pincode || cookData.pincode || "");
          
          form.setValue("profile_image", cookData.profile_image || "");
          setImageUrl(cookData.profile_image || "");
          form.setValue("cuisineType", cookData.cuisineType || cookData.cuisine_type || "");
          form.setValue("description", cookData.description || "");
          
          if (cookData.certification) {
            setCertifications(cookData.certification);
            form.setValue("certification", cookData.certification);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching cook data:", error);
      toast({
        title: "Error",
        description: "Failed to load cook data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCertification = () => {
    const newCert = {
      name: "",
      issuer: "",
      date: "",
      url: "",
    };
    const currentCerts = form.getValues("certification") || [];
    setCertifications([...certifications, newCert]);
    form.setValue("certification", [...currentCerts, newCert]);
  };

  const removeCertification = (index: number) => {
    const updatedCerts = certifications.filter((_, i) => i !== index);
    setCertifications(updatedCerts);
    form.setValue("certification", updatedCerts);
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Create local preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setUploadedImage(file);
    } catch (error) {
      console.error("Error creating preview:", error);
      toast({
        title: "Error",
        description: "Failed to preview image",
        variant: "destructive",
      });
    }
  };
  const handleLocationSelect = (lat: number, lng: number) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);

    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      let finalImageUrl = values.profile_image; // Keep existing if no new upload
      if (uploadedImage) {
        const fileExt = uploadedImage.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("cook-images")
          .upload(fileName, uploadedImage);

        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("cook-images").getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("cooks")
        .update({
          id: user.id, // Use 'id' as primary identifier
          user_id: user.id, 
          auth_user_id: user.id,
          cook_id: user.id, // Keep for backward compatibility
          email: values.email,
          first_name: values.first_name,
          last_name: values.last_name,
          name: `${values.first_name} ${values.last_name}`, // For compatibility
          phone: values.phone,
          profile_image: finalImageUrl,
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
          },
          city: values.city, // Store city separately too
          state: values.state, // Store state separately too
          pincode: values.pincode, // Store pincode separately too
          cuisine_type: values.cuisineType, // New column format
          cuisineType: values.cuisineType, // Old column format
          description: values.description,
          certification: values.certification,
          password: null, // never store plaintext; Supabase Auth holds the hashed password
          region: values.state,
          is_available: true, // New column format
          isAvailable: true, // Old column format
          total_orders: 0, // New column format
          totalorders: 0, // Old column format
          rating: 0.00,
          created_at: new Date().toISOString(),
        })
        .eq("cook_id", user.id) // Match the existing record using cook_id
        .single();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      localStorage.removeItem("registrationData");
      router.push("/");
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="profile_image">Profile Picture</Label>
          <Input
            id="profile_image"
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) {
                handleImageUpload(file);
              }
            }}
          />
          {previewUrl || imageUrl ? (
            <img
              src={previewUrl || imageUrl}
              alt="Profile preview"
              className="w-24 h-24 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/fallback-image.png"; // Add a fallback image
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pincode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pincode</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your cooking experience and specialties"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be displayed to students when they view your profile
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Certifications</h3>
            <Button type="button" onClick={addCertification}>
              Add Certification
            </Button>
          </div>

          {certifications.map((cert, index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-4 p-4 border rounded"
            >
              <FormField
                control={form.control}
                name={`certification.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certification.${index}.issuer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuing Organization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certification.${index}.date`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Issued</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`certification.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeCertification(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
