"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Star } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { Rating } from "@/types/student"

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().min(10, {
    message: "Review must be at least 10 characters.",
  }),
})

interface RatingFormProps {
  orderId: string
  toId: string
  fromId: string
  onSuccess?: (rating: Rating) => void
}

export function RatingForm({ orderId, toId, fromId, onSuccess }: RatingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      review: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Here we would typically make an API call to submit the rating
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const rating: Rating = {
        id: Math.random().toString(),
        fromId,
        toId,
        orderI: orderId,
        rating: values.rating,
        review: values.review,
        createdAt: new Date(),
      }

      toast({
        title: "Rating submitted!",
        description: "Thank you for your feedback.",
      })

      onSuccess?.(rating)
      form.reset()
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
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      type="button"
                      variant="ghost"
                      className="p-0 h-8 w-8"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (hoveredStar ?? field.value)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="review"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your review here..." className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Rating
        </Button>
      </form>
    </Form>
  )
}

