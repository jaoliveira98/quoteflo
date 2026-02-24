"use client";

import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewQuoteButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  asChild?: boolean;
}

export function NewQuoteButton({
  children,
  href = "/quotes/new",
  variant = "default",
  size,
  className,
  asChild,
}: NewQuoteButtonProps) {
  const nav = useDashboardNav();

  if (nav) {
    if (!nav.hasAccess) {
      return (
        <Button
          variant={variant}
          size={size}
          className={cn(className)}
          disabled
          onClick={(e) => e.preventDefault()}
          aria-disabled="true"
        >
          {children}
        </Button>
      );
    }

    return (
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => nav.startNavigation(href)}
      >
        {children}
      </Button>
    );
  }

  if (asChild) {
    return (
      <Button variant={variant} size={size} className={className} asChild>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }

  return (
    <Button variant={variant} size={size} className={className} asChild>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function NewQuoteLink({
  children,
  href = "/quotes/new",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const nav = useDashboardNav();

  if (nav) {
    if (!nav.hasAccess) {
      return (
        <span className={cn("cursor-not-allowed opacity-60", className)} aria-disabled="true">
          {children}
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => nav.startNavigation(href)}
        className={cn("inline-flex items-center gap-1 text-brand-600 hover:text-brand-700", className)}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
