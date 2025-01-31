<<<<<<< HEAD
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
=======
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
>>>>>>> a6396a4 (Version lOLZ)

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
<<<<<<< HEAD
})

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
=======
});

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
>>>>>>> a6396a4 (Version lOLZ)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
<<<<<<< HEAD
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Here we would typically make an API call to register
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Registration successful!",
        description: "Welcome to FoodConnect! Please verify your email.",
      })

      router.push("/auth/verify")
    } catch (error) {
      toast({
        title: "Something went wrong.",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
=======
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.name.split(" ")[0],
            last_name: values.name.split(" ")[1],
            phone: values.phone,
          },
        },
      });

      if (error) {
        throw error;
      }
      // Store registration data in localStorage
      const registrationData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
      };
      localStorage.setItem(
        "registrationData",
        JSON.stringify(registrationData)
      );

      toast({
        title: "Registration started",
        description: "Please complete your profile setup.",
      });
      // Sign in the user immediately after registration
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        throw signInError;
      }

      // Redirect to the additional information page
      router.push("/registration");

      
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Something went wrong.",
          description: "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
>>>>>>> a6396a4 (Version lOLZ)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" {...field} />
              </FormControl>
<<<<<<< HEAD
              <FormDescription>We'll send you a verification email.</FormDescription>
=======
              <FormDescription>
                We'll send you a verification email.
              </FormDescription>
>>>>>>> a6396a4 (Version lOLZ)
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
                <Input placeholder="1234567890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormDescription>At least 8 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
<<<<<<< HEAD
  )
}

=======
  );
}
>>>>>>> a6396a4 (Version lOLZ)
