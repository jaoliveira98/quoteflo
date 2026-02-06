"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CustomersSearchProps {
  currentSearch: string;
}

export function CustomersSearch({ currentSearch }: CustomersSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(search ? `/customers?search=${encodeURIComponent(search)}` : "/customers");
    });
  };

  const handleSearchClear = () => {
    setSearch("");
    startTransition(() => {
      router.push("/customers");
    });
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, phone..."
        className="pl-9 pr-9"
      />
      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleSearchClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-surface-400 hover:text-surface-600"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
