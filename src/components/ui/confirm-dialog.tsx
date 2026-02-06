"use client";

import * as React from "react";
import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-strong w-full max-w-md animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
              variant === "danger" ? "bg-red-100" : "bg-amber-100"
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                variant === "danger" ? "text-red-600" : "text-amber-600"
              )} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-surface-900 mb-1">{title}</h3>
              <p className="text-sm text-surface-600">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-100 text-surface-400"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-6 pb-6 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
