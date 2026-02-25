import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Use "end" for analytics so date label aligns at bottom */
  align?: "center" | "end";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  align = "center",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        align === "end" && "sm:items-end",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
        {subtitle != null && subtitle !== "" && (
          <p className="text-surface-600 mt-1">{subtitle}</p>
        )}
      </div>
      {action != null && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
