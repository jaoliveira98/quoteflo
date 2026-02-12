import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, "0");
  return `QF-${year}-${paddedSequence}`;
}

export function calculateVAT(amount: number, rate: number = 20): number {
  return amount * (rate / 100);
}

export function isValidUKPostcode(postcode: string): boolean {
  const regex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;
  return regex.test(postcode.trim());
}

export function formatUKPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, maxChars)
    .toUpperCase();
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getUniqueContacts(primary: string | null, list: string[] | null): string[] {
  return [
    ...(primary ? [primary] : []),
    ...(list || []),
  ].filter((val, idx, arr) => val && arr.indexOf(val) === idx);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const SAFE_REDIRECT_PREFIXES = [
  "/dashboard",
  "/quotes",
  "/customers",
  "/settings",
  "/analytics",
  "/services",
];

export function getSafeRedirectPath(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "/dashboard";
  const trimmed = path.trim();
  if (trimmed === "" || trimmed.startsWith("//") || trimmed.includes(":")) {
    return "/dashboard";
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const isSafe = SAFE_REDIRECT_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
  return isSafe ? normalized : "/dashboard";
}

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  try {
    const parsed = new URL(trimmed);
    if (!["https:", "http:"].includes(parsed.protocol)) return false;
    if (parsed.protocol === "http:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      return false;
    }
    if (["javascript:", "data:", "vbscript:"].some((p) => trimmed.toLowerCase().startsWith(p))) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
