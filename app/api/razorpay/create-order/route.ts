import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Credentials are read per request so a missing key fails the request, not the build.
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    console.error('Missing Razorpay credentials:', {
      keyId: key_id ? 'present' : 'missing',
      keySecret: key_secret ? 'present' : 'missing',
    });
    return null;
  }
  return new Razorpay({ key_id, key_secret });
}

export async function POST(request: Request) {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return NextResponse.json({ error: 'Payments are not configured' }, { status: 500 });
  }
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Error creating order',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 