import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_db_id,
    } = await request.json();

    // Validate request
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed: Missing parameters" },
        { status: 400 }
      );
    }

    // Create the signature to verify the payment
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    // Compare signatures
    if (digest !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    // If we have an order ID in our database, update it
    if (order_db_id) {
      const supabase = createClient();
      
      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order_db_id);

      if (orderError) {
        console.error("Error updating order:", orderError);
        // Continue with success response even if DB update fails
      }

      // Get order data to update cook's balance
      const { data: orderData, error: fetchError } = await supabase
        .from("orders")
        .select("cook_id, total")
        .eq("id", order_db_id)
        .single();

      if (!fetchError && orderData) {
        // Update cook's balance
        const { error: cookPaymentError } = await supabase
          .from("cook_payments")
          .insert({
            cook_id: orderData.cook_id,
            order_id: order_db_id,
            amount: orderData.total,
            status: "pending", // Will be processed later
          });

        if (cookPaymentError) {
          console.error("Error creating cook payment:", cookPaymentError);
        }
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
