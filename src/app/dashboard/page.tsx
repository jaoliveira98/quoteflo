import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardNavLink } from "@/components/dashboard-nav-link";
import { NewQuoteButton } from "@/components/new-quote-button";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
  Clock,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { getCachedQuotesList } from "@/lib/data/quotes";
import { STATUS_COLORS, STATUS_ICONS, STATUS_ICON_STYLES, STATUS_LABELS } from "@/lib/constants";
import type { QuoteStatus } from "@/types";

export default async function DashboardPage() {
  const profile = await requireAuthWithProfile();
  const allQuotes = await getCachedQuotesList(profile.id, undefined, undefined, null);
  
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

  const recentActivity = allQuotes
    .flatMap((quote) => {
      const events: {
        id: string;
        quoteId: string;
        customerName: string;
        quoteNumber: string;
        type: "sent" | "viewed" | "accepted" | "declined";
        at: string;
      }[] = [];

      if (quote.sent_at) {
        events.push({
          id: `${quote.id}-sent-${quote.sent_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "sent",
          at: quote.sent_at,
        });
      }

      if (quote.viewed_at) {
        events.push({
          id: `${quote.id}-viewed-${quote.viewed_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "viewed",
          at: quote.viewed_at,
        });
      }

      if (quote.accepted_at) {
        events.push({
          id: `${quote.id}-accepted-${quote.accepted_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "accepted",
          at: quote.accepted_at,
        });
      }

      if (quote.status === "declined") {
        const declinedAt =
          quote.declined_at || quote.viewed_at || quote.sent_at || quote.created_at;
        events.push({
          id: `${quote.id}-declined-${declinedAt}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "declined",
          at: declinedAt,
        });
      }

      return events;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  const recentQuotes = allQuotes.slice(0, 4);
  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8 min-w-0">
        <PageHeader
          title="Dashboard"
          subtitle={
            allQuotes.length === 0
              ? `Welcome to QuoteFlo, ${profile.company_name}! Let's create your first quote.`
              : `Welcome back, ${profile.company_name}!`
          }
          action={
            <NewQuoteButton>
              <Plus className="h-4 w-4" />
              New Quote
            </NewQuoteButton>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Quotes" value={stats.totalQuotes} icon={FileText} iconVariant="surface" />
          <StatCard label="Sent" value={stats.sentQuotes} icon={Send} iconVariant="blue" />
          <StatCard label="Accepted" value={stats.acceptedQuotes} icon={CheckCircle2} iconVariant="green" />
          <StatCard
            label="Total Value"
            value={formatCurrency(stats.totalValue)}
            icon={PoundSterling}
            iconVariant="brand"
          />
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
                  {recentQuotes.map((quote) => {
                    const status = quote.status as QuoteStatus;
                    const StatusIcon = STATUS_ICONS[status];
                    const style = STATUS_ICON_STYLES[status];
                    return (
                    <DashboardNavLink
                      key={quote.id}
                      href={`/quotes/${quote.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">{quote.customer_name}</p>
                          <p className="text-xs text-surface-500 truncate">{quote.quote_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant={STATUS_COLORS[status]}>
                          {STATUS_LABELS[status]}
                        </Badge>
                        <span className="text-sm font-semibold text-surface-900 tabular-nums">
                          {formatCurrency(Number(quote.total))}
                        </span>
                      </div>
                    </DashboardNavLink>
                  );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="h-16 w-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-surface-400" />
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-1">Create your first quote</h3>
                  <p className="text-surface-600 text-sm mb-5 max-w-xs mx-auto">
                    Pick from your trade&apos;s service library, add customer details, and send a professional quote in minutes.
                  </p>
                  <NewQuoteButton>
                    <Plus className="h-4 w-4" />
                    Create your first quote
                  </NewQuoteButton>
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
                  <span className="text-sm text-surface-600 whitespace-nowrap">Avg. Quote Value</span>
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

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent activity</CardTitle>
              <span className="text-xs text-surface-500">
                Showing latest {recentActivity.length} updates
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((event) => {
                  const eventStatus = event.type as QuoteStatus;
                  const Icon = STATUS_ICONS[eventStatus];
                  const style = STATUS_ICON_STYLES[eventStatus];
                  const label =
                    event.type === "sent"
                      ? "Quote sent"
                      : event.type === "viewed"
                        ? "Quote opened"
                        : event.type === "accepted"
                          ? "Quote accepted"
                          : "Quote declined";

                  const date = new Date(event.at);
                  const formatted = `${date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })} • ${date.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`;

                  return (
                    <DashboardNavLink
                      key={event.id}
                      href={`/quotes/${event.quoteId}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}
                        >
                          <Icon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">
                            {event.customerName}
                          </p>
                          <p className="text-xs text-surface-500 truncate">
                            {label} • {event.quoteNumber}
                          </p>
                          <p className="text-xs text-surface-400 mt-0.5">{formatted}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-surface-400 flex-shrink-0 group-hover:text-surface-600" />
                    </DashboardNavLink>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
