import Stripe from "stripe";

// Initialize Stripe (only on server-side)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

// Price IDs - set these in your environment after creating products in Stripe
export const STRIPE_PRICES = {
  professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || "",
} as const;

// Plan configuration
export const PLANS = {
  starter: {
    name: "Starter",
    description: "Perfect for getting started",
    price: 0,
    interval: null,
    features: [
      "14-day free trial",
      "Unlimited quotes during trial",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    description: "For growing businesses",
    price: 19,
    interval: "month" as const,
    priceId: STRIPE_PRICES.professional_monthly,
    features: [
      "Unlimited quotes",
      "PDF generation",
      "Email sending",
      "Auto follow-ups",
      "Priority support",
    ],
  },
} as const;

// Helper to format price for display
export function formatPrice(amount: number, currency: string = "GBP"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Get the app URL for redirects
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
