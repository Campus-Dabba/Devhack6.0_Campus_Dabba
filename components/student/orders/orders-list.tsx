"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Mock data for orders
const mockOrders = [
  {
    id: "1",
    cookName: "Maria Garcia",
    date: new Date(),
    status: "Delivered",
    items: [
      { name: "Butter Chicken", quantity: 1, price: 250 },
      { name: "Naan", quantity: 2, price: 30 },
    ],
    total: 310,
  },
  {
    id: "2",
    cookName: "John Smith",
    date: new Date(Date.now() - 86400000), // Yesterday
    status: "In Progress",
    items: [
      { name: "Vegetable Biryani", quantity: 1, price: 180 },
      { name: "Raita", quantity: 1, price: 40 },
    ],
    total: 220,
  },
]

export function OrdersList() {
  const [openOrder, setOpenOrder] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <Collapsible
          key={order.id}
          open={openOrder === order.id}
          onOpenChange={() => setOpenOrder(openOrder === order.id ? null : order.id)}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.id}</CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CardDescription>
                {format(order.date, "PPP")} - {order.status}
              </CardDescription>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Items:</p>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
            <CardFooter className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold">₹{order.total}</span>
            </CardFooter>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}

