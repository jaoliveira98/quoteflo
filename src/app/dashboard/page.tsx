import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  PoundSterling,
  Plus,
  ArrowUpRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_COLORS } from "@/lib/constants";
import type { QuoteStatus } from "@/types";

export default async function DashboardPage() {
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  
  const allQuotes = quotes || [];
  
  const { draftCount, awaitingCount, acceptedCount, totalValue } = allQuotes.reduce(
    (acc, q) => {
      const val = Number(q.total) || 0;
      acc.totalValue += val;
      if (q.status === "draft") acc.draftCount++;
      if (q.status === "sent" || q.status === "viewed") acc.awaitingCount++;
      if (q.status === "accepted") acc.acceptedCount++;
      return acc;
    },
    { draftCount: 0, awaitingCount: 0, acceptedCount: 0, totalValue: 0 }
  );
  
  const sentQuotes = allQuotes.length - draftCount;
  const stats = {
    totalQuotes: allQuotes.length,
    sentQuotes,
    acceptedQuotes: acceptedCount,
    totalValue,
    acceptanceRate: sentQuotes > 0 ? Math.round((acceptedCount / sentQuotes) * 100) : 0,
    avgQuoteValue: allQuotes.length > 0 ? Math.round(totalValue / allQuotes.length) : 0,
    draftCount,
    awaitingCount,
  };
  
  const recentQuotes = allQuotes.slice(0, 4);
  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
            <p className="text-surface-600">
              {allQuotes.length === 0 
                ? `Welcome to QuoteFlo, ${profile.company_name}! Let's create your first quote.`
                : `Welcome back, ${profile.company_name}!`
              }
            </p>
          </div>
          <Button asChild>
            <Link href="/quotes/new">
              <Plus className="h-4 w-4" />
              New Quote
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Quotes</p>
                  <p className="text-2xl font-bold text-surface-900">{stats.totalQuotes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Sent</p>
                  <p className="text-2xl font-bold text-surface-900">{stats.sentQuotes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Accepted</p>
                  <p className="text-2xl font-bold text-surface-900">{stats.acceptedQuotes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Value</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <PoundSterling className="h-5 w-5 text-brand-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance Rate Card */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Quotes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/quotes">
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentQuotes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuotes.map((quote) => (
                    <Link
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                          <FileText className="h-5 w-5 text-surface-500 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{quote.customer_name}</p>
                          <p className="text-sm text-surface-500">{quote.quote_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={STATUS_COLORS[quote.status as QuoteStatus]}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Badge>
                        <span className="font-medium text-surface-900">
                          {formatCurrency(Number(quote.total))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-1">Create your first quote</h3>
                  <p className="text-surface-600 text-sm mb-5 max-w-xs mx-auto">
                    Pick from your trade&apos;s service library, add customer details, and send a professional quote in minutes.
                  </p>
                  <Button asChild>
                    <Link href="/quotes/new">
                      <Plus className="h-4 w-4" />
                      Create your first quote
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-surface-600">Acceptance Rate</span>
                  <span className="text-sm font-medium text-surface-900">{stats.acceptanceRate}%</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${stats.acceptanceRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-600">Avg. Quote Value</span>
                  <span className="text-lg font-semibold text-surface-900">
                    {formatCurrency(stats.avgQuoteValue)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-200">
                <p className="text-sm text-surface-600 mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {stats.draftCount > 0 && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/quotes?status=draft">
                        <Clock className="h-4 w-4 text-surface-400" />
                        {stats.draftCount} draft{stats.draftCount !== 1 ? 's' : ''} pending
                      </Link>
                    </Button>
                  )}
                  {stats.awaitingCount > 0 && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/quotes?status=sent">
                        <Send className="h-4 w-4 text-surface-400" />
                        {stats.awaitingCount} awaiting response
                      </Link>
                    </Button>
                  )}
                  {stats.draftCount === 0 && stats.awaitingCount === 0 && (
                    <p className="text-sm text-surface-500 text-center py-2">
                      No pending quotes
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
