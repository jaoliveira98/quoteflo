"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastStyles = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

const toastIconStyles = {
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-600",
  info: "text-blue-600",
};

const toastTitleStyles = {
  success: "text-green-900",
  error: "text-red-900",
  warning: "text-amber-900",
  info: "text-blue-900",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration || (toast.type === "error" ? 6000 : 4000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto rounded-xl border px-4 py-3 shadow-medium animate-slide-up flex items-start gap-3",
                toastStyles[toast.type]
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", toastIconStyles[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", toastTitleStyles[toast.type])}>
                  {toast.title}
                </p>
                {toast.description && (
                  <p className={cn("text-sm mt-0.5 opacity-80", toastTitleStyles[toast.type])}>
                    {toast.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeToast(toast.id)}
                className={cn(
                  "flex-shrink-0 h-6 w-6 hover:bg-black/5",
                  toastTitleStyles[toast.type]
                )}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
