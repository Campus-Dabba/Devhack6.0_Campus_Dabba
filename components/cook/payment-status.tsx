"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
  customer_name?: string;
}

export function PaymentStatus() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPayments() {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error("Not authenticated");
        }

        // Get cook ID
        const { data: cookData, error: cookError } = await supabase
          .from("cooks")
          .select("id")
          .eq("cook_id", session.user.id)
          .single();

        if (cookError) {
          throw cookError;
        }

        // Fetch payments with order details and customer info
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("cook_payments")
          .select(`
            id,
            order_id,
            amount,
            status,
            created_at,
            orders:order_id(user_id)
          `)
          .eq("cook_id", cookData.id)
          .order("created_at", { ascending: false });

        if (paymentsError) {
          throw paymentsError;
        }

        // Get customer names for each payment
        const payments = await Promise.all(
          paymentsData.map(async (payment) => {
            let customerName = "Unknown Customer";
            
            if (payment.orders?.user_id) {
              const { data: userData } = await supabase
                .from("users")
                .select("first_name, last_name")
                .eq("id", payment.orders.user_id)
                .single();
                
              if (userData) {
                customerName = `${userData.first_name} ${userData.last_name}`;
              }
            }
            
            return {
              ...payment,
              customer_name: customerName
            };
          })
        );

        setPayments(payments);

        // Calculate totals
        const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const pending = payments
          .filter(payment => payment.status === "pending")
          .reduce((sum, payment) => sum + payment.amount, 0);
          
        setTotalEarnings(total);
        setPendingEarnings(pending);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Failed to load payment data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Error loading payment data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>
          Track your earnings and payment status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-xl">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-xl">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{pendingEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {payments.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No payment records found yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.customer_name}</TableCell>
                  <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "completed"
                          ? "success"
                          : payment.status === "pending"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {payment.status === "completed"
                        ? "Paid"
                        : payment.status === "pending"
                        ? "Processing"
                        : payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
