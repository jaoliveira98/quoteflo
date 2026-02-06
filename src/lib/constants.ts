import type { QuoteStatus, Trade } from "@/types";
import {
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Zap,
  Wrench,
  Hammer,
} from "lucide-react";

export const STATUS_COLORS: Record<QuoteStatus, "success" | "warning" | "info" | "secondary"> = {
  draft: "secondary",
  sent: "info",
  viewed: "warning",
  accepted: "success",
  declined: "secondary",
  expired: "secondary",
};

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export const STATUS_ICONS: Record<QuoteStatus, typeof FileText> = {
  draft: FileText,
  sent: Send,
  viewed: Eye,
  accepted: CheckCircle2,
  declined: XCircle,
  expired: Clock,
};

export const STATUS_CONFIG: Record<
  QuoteStatus,
  { label: string; variant: "success" | "warning" | "info" | "secondary"; icon: typeof FileText }
> = {
  draft: { label: "Draft", variant: "secondary", icon: Edit },
  sent: { label: "Sent", variant: "info", icon: Send },
  viewed: { label: "Viewed", variant: "warning", icon: Eye },
  accepted: { label: "Accepted", variant: "success", icon: CheckCircle2 },
  declined: { label: "Declined", variant: "secondary", icon: XCircle },
  expired: { label: "Expired", variant: "secondary", icon: Clock },
};

export const TRADES_CONFIG: {
  value: Trade;
  label: string;
  icon: typeof Zap;
  description: string;
}[] = [
  { value: "electrician", label: "Electrician", icon: Zap, description: "Electrical work & testing" },
  { value: "plumber", label: "Plumber", icon: Wrench, description: "Plumbing & heating" },
  { value: "builder", label: "Builder", icon: Hammer, description: "Construction & renovation" },
];

export const BRAND_COLORS = [
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Orange" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#0f172a", label: "Dark" },
] as const;
