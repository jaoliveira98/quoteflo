import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo mark */}
      <div className="relative">
        <div
          className={cn(
            "rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center font-bold text-white shadow-sm",
            size === "sm" && "h-7 w-7 text-sm",
            size === "md" && "h-8 w-8 text-base",
            size === "lg" && "h-10 w-10 text-lg"
          )}
        >
          Q
        </div>
        {/* Small accent dot */}
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-400",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" && "h-3 w-3"
          )}
        />
      </div>
      
      {/* Wordmark */}
      <span className={cn("font-semibold tracking-tight", sizes[size])}>
        <span className="text-surface-900">Quote</span>
        <span className="text-brand-600">Flo</span>
      </span>
    </div>
  );
}
