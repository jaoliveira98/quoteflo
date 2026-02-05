"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotesFilterProps {
  currentSearch: string;
  currentStatus: string;
  counts: {
    all: number;
    draft: number;
    sent: number;
    viewed: number;
    accepted: number;
    declined: number;
  };
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

export function QuotesFilter({ currentSearch, currentStatus, counts }: QuotesFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const updateFilters = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus && newStatus !== "all") params.set("status", newStatus);
    
    startTransition(() => {
      router.push(`/quotes${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, currentStatus);
  };

  const handleSearchClear = () => {
    setSearch("");
    updateFilters("", currentStatus);
  };

  const handleStatusChange = (status: string) => {
    updateFilters(search, status);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or quote #..."
          className="pl-9 pr-9"
        />
        {search && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count = counts[filter.value as keyof typeof counts];
          const isActive = currentStatus === filter.value || (filter.value === "all" && !currentStatus);
          
          return (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-100 text-brand-700"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              )}
            >
              {filter.label}
              {count > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-brand-200 text-brand-800" : "bg-surface-200 text-surface-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
