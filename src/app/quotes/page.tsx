import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QuotesFilter } from "./quotes-filter";

const statusColors: Record<string, "success" | "warning" | "info" | "secondary"> = {
  draft: "secondary",
  sent: "info",
  viewed: "warning",
  accepted: "success",
  declined: "secondary",
  expired: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  // Build query
  let query = supabase
    .from("quotes")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  
  // Apply status filter
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  
  const { data: quotes } = await query;
  
  let filteredQuotes = quotes || [];
  
  // Apply search filter (client-side for simplicity)
  if (search) {
    const searchLower = search.toLowerCase();
    filteredQuotes = filteredQuotes.filter(quote => 
      quote.customer_name.toLowerCase().includes(searchLower) ||
      quote.quote_number.toLowerCase().includes(searchLower) ||
      (quote.customer_email && quote.customer_email.toLowerCase().includes(searchLower))
    );
  }

  // Get counts for filter badges
  const allQuotes = quotes || [];
  const counts = {
    all: allQuotes.length,
    draft: allQuotes.filter(q => q.status === "draft").length,
    sent: allQuotes.filter(q => q.status === "sent").length,
    viewed: allQuotes.filter(q => q.status === "viewed").length,
    accepted: allQuotes.filter(q => q.status === "accepted").length,
    declined: allQuotes.filter(q => q.status === "declined").length,
  };

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Quotes</h1>
            <p className="text-surface-600">
              {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'}
              {(search || status) && ` found`}
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
          counts={counts}
        />

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="space-y-3">
            {filteredQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="block"
              >
                <Card className="hover:border-surface-300 hover:shadow-soft transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-surface-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-surface-900 truncate">
                              {quote.customer_name}
                            </p>
                            <Badge variant={statusColors[quote.status]} className="flex-shrink-0">
                              {statusLabels[quote.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-surface-500">
                            <span>{quote.quote_number}</span>
                            <span>•</span>
                            <span>{formatDate(quote.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="font-semibold text-surface-900">
                          {formatCurrency(Number(quote.total))}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              {search || status ? (
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
