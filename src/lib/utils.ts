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

export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, maxChars)
    .toUpperCase();
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
