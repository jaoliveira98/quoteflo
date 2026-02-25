import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardIconVariant = "surface" | "blue" | "green" | "brand";

const iconVariantClasses: Record<
  StatCardIconVariant,
  { container: string; icon: string }
> = {
  surface: "bg-surface-100 text-surface-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  brand: "bg-brand-100 text-brand-600",
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  iconVariant?: StatCardIconVariant;
  /** Optional change indicator or suffix below the value (e.g. "vs prev.") */
  footer?: React.ReactNode;
  className?: string;
}

const ZWSP = "\u200B";

function valueWithBreakOpportunities(displayValue: React.ReactNode): React.ReactNode {
  if (typeof displayValue !== "string") return displayValue;
  return displayValue.replace(/,/g, `,${ZWSP}`);
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconVariant = "surface",
  footer,
  className,
}: StatCardProps) {
  const variant = iconVariantClasses[iconVariant];
  const displayValue = valueWithBreakOpportunities(value);
  return (
    <Card className={cn("min-w-0", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-surface-500">{label}</p>
              <div className="mt-0.5 text-base font-bold text-surface-900 tabular-nums min-w-0 break-words leading-tight">
                {displayValue}
              </div>
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                variant
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {footer != null && <div className="mt-2 flex items-center gap-1.5 flex-wrap">{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
