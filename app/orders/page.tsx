import type { Metadata } from "next"
import { OrdersList } from "@/components/student/orders/orders-list"

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your food orders",
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">View and manage your current and past orders</p>
      </div>
      <OrdersList />
    </div>
  )
}

