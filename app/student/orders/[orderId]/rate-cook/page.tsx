import type { Metadata } from "next"

import { RatingForm } from "@/components/shared/rating-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Rate Your Cook",
  description: "Share your feedback about your meal and cook",
}

// In a real app, we would fetch this data from an API
const sampleOrder = {
  id: "123",
  cookId: "456",
  cookName: "Maria Garcia",
  studentId: "789",
  items: [
    { name: "Butter Chicken", quantity: 1 },
    { name: "Naan", quantity: 2 },
  ],
}

export default function RateCookPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
          <CardDescription>
            Your feedback helps {sampleOrder.cookName} improve their service and helps other students make informed
            decisions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">Order Details</h3>
              <ul className="mt-2 text-sm">
                {sampleOrder.items.map((item) => (
                  <li key={item.name}>
                    {item.quantity}x {item.name}
                  </li>
                ))}
              </ul>
            </div>
            <RatingForm
              orderId={params.orderId}
              toId={sampleOrder.cookId}
              fromId={sampleOrder.studentId}
              onSuccess={() => {
                // In a real app, we would redirect to the orders page
                window.location.href = "/student/orders"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

