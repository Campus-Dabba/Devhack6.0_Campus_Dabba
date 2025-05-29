import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Load external scripts dynamically
export function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Format price for display (₹)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(price);
}

// Convert price to paise for Razorpay (multiply by 100)
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Convert paise to rupees for display (divide by 100)
export function toRupees(paise: number): number {
  return paise / 100;
}
