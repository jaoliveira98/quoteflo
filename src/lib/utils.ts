import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in GBP
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

/**
 * Format date in UK format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Generate a quote number (e.g., QF-2026-0001)
 */
export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, "0");
  return `QF-${year}-${paddedSequence}`;
}

/**
 * Calculate VAT
 */
export function calculateVAT(amount: number, rate: number = 20): number {
  return amount * (rate / 100);
}

/**
 * UK postcode validation
 */
export function isValidUKPostcode(postcode: string): boolean {
  const regex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
  return regex.test(postcode.trim());
}

/**
 * Format UK phone number
 */
export function formatUKPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}
