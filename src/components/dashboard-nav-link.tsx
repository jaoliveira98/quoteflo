"use client";

import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";

interface DashboardNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardNavLink({ href, children, className }: DashboardNavLinkProps) {
  const nav = useDashboardNav();

  if (nav) {
    return (
      <button
        type="button"
        onClick={() => nav.startNavigation(href)}
        className={cn("block w-full text-left", className)}
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
