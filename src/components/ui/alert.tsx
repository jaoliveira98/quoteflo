import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3 [&>svg]:flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:mt-0.5",
  {
    variants: {
      variant: {
        default: "bg-surface-50 border-surface-200 text-surface-900",
        destructive:
          "bg-red-50 border-red-200 text-red-700 [&>svg]:text-red-500",
        success:
          "bg-green-50 border-green-200 text-green-700 [&>svg]:text-green-500",
        warning:
          "bg-amber-50 border-amber-200 text-amber-700 [&>svg]:text-amber-500",
        info: "bg-blue-50 border-blue-200 text-blue-700 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const alertIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", icon = true, children, ...props }, ref) => {
    const IconComponent = alertIcons[variant || "default"];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon && <IconComponent />}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
