import { cn } from "@/lib/utils";

interface ContactInfoRowProps {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

/** Single row for email/phone/address per design guide: icon + text, truncation-friendly */
export function ContactInfoRow({
  icon: Icon,
  children,
  className,
}: ContactInfoRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-surface-600 text-sm min-w-0 flex-1",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );
}
