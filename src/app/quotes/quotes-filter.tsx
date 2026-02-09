"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuotesFilterProps {
  currentSearch: string;
  currentStatus: string;
  currentDateFilter: string;
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

const dateFilters = [
  { value: "all", label: "All time" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
];

export function QuotesFilter({ currentSearch, currentStatus, currentDateFilter, counts }: QuotesFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const updateFilters = (newSearch: string, newStatus: string, newDateFilter: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set("search", newSearch);
    if (newStatus && newStatus !== "all") params.set("status", newStatus);
    if (newDateFilter && newDateFilter !== "all") params.set("date", newDateFilter);
    
    startTransition(() => {
      router.push(`/quotes${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(search, currentStatus, currentDateFilter);
  };

  const handleSearchClear = () => {
    setSearch("");
    updateFilters("", currentStatus, currentDateFilter);
  };

  const handleStatusChange = (status: string) => {
    updateFilters(search, status, currentDateFilter);
  };

  const handleDateFilterChange = (dateFilter: string) => {
    updateFilters(search, currentStatus, dateFilter);
  };

  return (
    <div className="space-y-4">
      {/* Search and Date Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or quote #..."
            className="pl-9 pr-9"
          />
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSearchClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-surface-400 hover:text-surface-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Date Filter */}
        <Select
          value={currentDateFilter || "all"}
          onValueChange={handleDateFilterChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-full sm:w-[180px] h-11">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {dateFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => {
          const count = counts[filter.value as keyof typeof counts];
          const isActive = currentStatus === filter.value || (filter.value === "all" && !currentStatus);
          
          return (
            <Button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              disabled={isPending}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-full gap-1.5",
                isActive
                  ? "bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200"
                  : "bg-surface-50 text-surface-600 hover:bg-surface-100"
              )}
            >
              {filter.label}
              {count > 0 && (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={cn(
                    "ml-0.5 px-1.5 py-0 text-xs h-5",
                    isActive ? "bg-brand-200 text-brand-800" : "bg-surface-200 text-surface-500"
                  )}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
