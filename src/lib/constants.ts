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
  Paintbrush,
  TreePine,
  Grid3X3,
  Layers,
  Lock,
  Wind,
  Flame,
  PanelTop,
  Fence,
  Sparkles,
  Hand,
  HelpCircle,
  Drill,
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
  { value: "carpenter", label: "Carpenter", icon: Drill, description: "Woodwork & joinery" },
  { value: "painter", label: "Painter & Decorator", icon: Paintbrush, description: "Painting & decorating" },
  { value: "roofer", label: "Roofer", icon: Layers, description: "Roofing & gutters" },
  { value: "landscaper", label: "Landscaper", icon: TreePine, description: "Garden & landscaping" },
  { value: "tiler", label: "Tiler", icon: Grid3X3, description: "Wall & floor tiling" },
  { value: "plasterer", label: "Plasterer", icon: PanelTop, description: "Plastering & rendering" },
  { value: "locksmith", label: "Locksmith", icon: Lock, description: "Locks & security" },
  { value: "hvac", label: "HVAC Engineer", icon: Wind, description: "Heating, ventilation & AC" },
  { value: "gas_engineer", label: "Gas Engineer", icon: Flame, description: "Gas work & boilers" },
  { value: "glazier", label: "Glazier", icon: PanelTop, description: "Glass & windows" },
  { value: "fencer", label: "Fencer", icon: Fence, description: "Fencing & gates" },
  { value: "cleaner", label: "Cleaner", icon: Sparkles, description: "Cleaning services" },
  { value: "handyman", label: "Handyman", icon: Hand, description: "General maintenance" },
  { value: "other", label: "Other", icon: HelpCircle, description: "Custom trade" },
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
