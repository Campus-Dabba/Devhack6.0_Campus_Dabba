import { toast } from "@/components/ui/use-toast";

// Razorpay key
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_p3NOjXkxa50O3G';

interface RazorpayOptions {
  key: string;
  amount: number; // in paise (100 paise = ₹1)
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface PaymentParams {
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Load Razorpay script
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      toast({
        title: "Payment system error",
        description: "Failed to load payment system. Please try again later.",
        variant: "destructive"
      });
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize payment - simpler version without server-side order creation
export const initiatePayment = (options: PaymentParams): Promise<any> => {
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      image: options.image,
      prefill: options.prefill,
      notes: options.notes,
      theme: options.theme || { color: "#FF5722" },
      handler: function (response: any) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Payment cancelled by user"));
        },
      },
    });
    
    rzp.open();
  });
};
