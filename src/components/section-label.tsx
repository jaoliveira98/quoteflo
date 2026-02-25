import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** Category/section label per design guide: text-sm font-semibold text-surface-500 uppercase tracking-wider */
export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <h2
      className={cn(
        "text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3",
        className
      )}
    >
      {children}
    </h2>
  );
}
