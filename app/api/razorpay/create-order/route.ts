import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/utils/supabase/server";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_p3NOjXkxa50O3G",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "", // Add your secret key to env vars
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt, notes } = await request.json();

    // Validate request
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required" },
        { status: 400 }
      );
    }

    // Create order
    const options = {
      amount: amount,
      currency: currency,
      receipt: receipt || `receipt_${uuidv4()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
