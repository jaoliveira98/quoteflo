import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { QuoteStatus } from "@/types";
import { QuotesFilter } from "./quotes-filter";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; date?: string }>;
}) {
  const { search, status, date } = await searchParams;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  // Helper function to get date range based on filter
  const getDateRange = (dateFilter: string | undefined) => {
    if (!dateFilter || dateFilter === "all") return null;
    
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let startDate: Date;
    
    switch (dateFilter) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startDate.toISOString(), end: endDate.toISOString() };
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { start: startDate.toISOString(), end: lastMonthEnd.toISOString() };
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: startDate.toISOString(), end: endDate.toISOString() };
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        return { start: startDate.toISOString(), end: endDate.toISOString() };
      case "last_year":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return { start: startDate.toISOString(), end: lastYearEnd.toISOString() };
      default:
        return null;
    }
  };
  
  const dateRange = getDateRange(date);
  
  let query = supabase
    .from("quotes")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  
  if (dateRange) {
    query = query.gte("created_at", dateRange.start);
    if (dateRange.end) {
      query = query.lte("created_at", dateRange.end);
    }
  }
  
  const { data: quotes } = await query;
  
  let filteredQuotes = quotes || [];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredQuotes = filteredQuotes.filter(quote => 
      quote.customer_name.toLowerCase().includes(searchLower) ||
      quote.quote_number.toLowerCase().includes(searchLower) ||
      (quote.customer_email && quote.customer_email.toLowerCase().includes(searchLower))
    );
  }

  const allQuotes = quotes || [];
  const counts = {
    all: allQuotes.length,
    draft: allQuotes.filter(q => q.status === "draft").length,
    sent: allQuotes.filter(q => q.status === "sent").length,
    viewed: allQuotes.filter(q => q.status === "viewed").length,
    accepted: allQuotes.filter(q => q.status === "accepted").length,
    declined: allQuotes.filter(q => q.status === "declined").length,
  };

  // Group quotes by month and year
  const groupedQuotes = filteredQuotes.reduce((acc, quote) => {
    const date = new Date(quote.created_at);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        label: date.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
        quotes: [],
      };
    }
    
    acc[key].quotes.push(quote);
    return acc;
  }, {} as Record<string, { label: string; quotes: typeof filteredQuotes }>);

  // Sort groups by date (most recent first)
  const sortedGroups = Object.entries(groupedQuotes).sort(([keyA], [keyB]) => {
    const [yearA, monthA] = keyA.split("-").map(Number);
    const [yearB, monthB] = keyB.split("-").map(Number);
    if (yearA !== yearB) return yearB - yearA;
    return monthB - monthA;
  }) as [string, { label: string; quotes: typeof filteredQuotes }][];

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Quotes</h1>
            <p className="text-surface-600">
              {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
              {(search || status || (date && date !== "all")) && ` found`}
            </p>
          </div>
          <Button asChild>
            <Link href="/quotes/new">
              <Plus className="h-4 w-4" />
              New Quote
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <QuotesFilter 
          currentSearch={search || ""} 
          currentStatus={status || "all"}
          currentDateFilter={date || "all"}
          counts={counts}
        />

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-6">
            {sortedGroups.map(([key, { label, quotes }]) => (
              <div key={key} className="space-y-2">
                <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">
                  {label}
                </h2>
                {quotes.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/quotes/${quote.id}`}
                    className="block"
                  >
                    <Card className="hover:border-surface-300 hover:shadow-soft transition-all group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 transition-colors">
                              <FileText className="h-5 w-5 text-surface-500 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-surface-900 truncate">
                                  {quote.customer_name}
                                </p>
                                <Badge variant={STATUS_COLORS[quote.status as QuoteStatus]} className="flex-shrink-0">
                                  {STATUS_LABELS[quote.status as QuoteStatus]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-surface-500">
                                <span className="truncate">{quote.quote_number}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">{formatDate(quote.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                            <span className="font-semibold text-surface-900 text-sm sm:text-base">
                              {formatCurrency(Number(quote.total))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              {search || status || (date && date !== "all") ? (
                <>
                  <h3 className="text-lg font-medium text-surface-900 mb-2">No quotes found</h3>
                  <p className="text-surface-600 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/quotes">Clear filters</Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-surface-900 mb-2">No quotes yet</h3>
                  <p className="text-surface-600 mb-6">
                    Create your first quote and start winning more jobs.
                  </p>
                  <Button asChild>
                    <Link href="/quotes/new">
                      <Plus className="h-4 w-4" />
                      Create your first quote
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
