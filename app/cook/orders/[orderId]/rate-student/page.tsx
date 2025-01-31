import type { Metadata } from "next"

import { RatingForm } from "@/components/shared/rating-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Rate Student",
  description: "Share your feedback about the student",
}

// In a real app, we would fetch this data from an API
const sampleOrder = {
  id: "123",
  studentId: "456",
  studentName: "John Smith",
  cookId: "789",
  orderDate: new Date().toLocaleDateString(),
  totalAmount: 250,
}

export default function RateStudentPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Rate Student</CardTitle>
          <CardDescription>
            Your feedback helps maintain a respectful community and helps other cooks make informed decisions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium">Order Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>Student: {sampleOrder.studentName}</p>
                <p>Order Date: {sampleOrder.orderDate}</p>
                <p>Total Amount: ₹{sampleOrder.totalAmount}</p>
              </div>
            </div>
            <RatingForm
              orderId={params.orderId}
              toId={sampleOrder.studentId}
              fromId={sampleOrder.cookId}
              onSuccess={() => {
                // In a real app, we would redirect to the orders page
                window.location.href = "/cook/orders"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

