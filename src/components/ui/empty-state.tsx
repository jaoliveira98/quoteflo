import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 sm:py-16", className)}>
      <div className="h-16 w-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-surface-600 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {children && (
        <div className="flex items-center justify-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
