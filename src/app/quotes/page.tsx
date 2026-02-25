import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardNavLink } from "@/components/dashboard-nav-link";
import { NewQuoteButton } from "@/components/new-quote-button";
import { PageHeader } from "@/components/page-header";
import { SectionLabel } from "@/components/section-label";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { getCachedQuotesList } from "@/lib/data/quotes";
import { STATUS_COLORS, STATUS_ICONS, STATUS_ICON_STYLES, STATUS_LABELS } from "@/lib/constants";
import type { QuoteStatus } from "@/types";
import { QuotesFilter } from "./quotes-filter";

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; date?: string }>;
}) {
  const { search, status, date } = await searchParams;
  const profile = await requireAuthWithProfile();

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

  const quotes = await getCachedQuotesList(
    profile.id,
    status,
    date,
    dateRange
  );

  let filteredQuotes = quotes;
  
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
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Quotes"
          subtitle={`${filteredQuotes.length} ${filteredQuotes.length === 1 ? "quote" : "quotes"}${(search || status || (date && date !== "all")) ? " found" : ""}`}
          action={
            <NewQuoteButton>
              <Plus className="h-4 w-4" />
              New Quote
            </NewQuoteButton>
          }
        />

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
                <SectionLabel>{label}</SectionLabel>
                {quotes.map((quote) => {
                  const status = quote.status as QuoteStatus;
                  const StatusIcon = STATUS_ICONS[status];
                  const style = STATUS_ICON_STYLES[status];
                  return (
                  <DashboardNavLink key={quote.id} href={`/quotes/${quote.id}`}>
                    <Card className="hover:border-surface-300 hover:shadow-soft transition-all group cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${style.color}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium text-surface-900 truncate">
                                  {quote.customer_name}
                                </p>
                                <Badge variant={STATUS_COLORS[status]} className="flex-shrink-0">
                                  {STATUS_LABELS[status]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-surface-500">
                                <span className="truncate">{quote.quote_number}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">{formatDate(quote.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-surface-900 tabular-nums flex-shrink-0">
                            {formatCurrency(Number(quote.total))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </DashboardNavLink>
                );
                })}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="px-6">
              {search || status || (date && date !== "all") ? (
                <EmptyState
                  icon={FileText}
                  title="No quotes found"
                  description="Try adjusting your search or filters"
                >
                  <Button variant="outline" asChild>
                    <Link href="/quotes">Clear filters</Link>
                  </Button>
                </EmptyState>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No quotes yet"
                  description="Create your first quote and start winning more jobs."
                >
                  <NewQuoteButton>
                    <Plus className="h-4 w-4" />
                    Create your first quote
                  </NewQuoteButton>
                </EmptyState>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
