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

  if (nav && !nav.hasAccess) {
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

  if (nav && !nav.hasAccess) {
    return (
      <span className={cn("cursor-not-allowed opacity-60", className)} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
