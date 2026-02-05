import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Send, 
  Eye,
  CheckCircle2, 
  XCircle,
  PoundSterling,
  TrendingUp,
  Clock,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "./analytics-charts";

interface QuoteWithDates {
  id: string;
  status: string;
  total: number;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  customer_name: string;
  customer_id: string | null;
}

export default async function AnalyticsPage() {
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  // Fetch all quotes
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, status, total, created_at, sent_at, viewed_at, accepted_at, customer_name, customer_id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  
  const allQuotes: QuoteWithDates[] = (quotes || []).map(q => ({
    ...q,
    total: Number(q.total) || 0
  }));

  // Calculate date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  // Current period (last 30 days)
  const currentPeriodQuotes = allQuotes.filter(q => new Date(q.created_at) >= thirtyDaysAgo);
  // Previous period (30-60 days ago)
  const previousPeriodQuotes = allQuotes.filter(q => {
    const date = new Date(q.created_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  // ===== OVERVIEW STATS =====
  const totalQuotes = allQuotes.length;
  const totalSent = allQuotes.filter(q => q.status !== "draft").length;
  const totalViewed = allQuotes.filter(q => ["viewed", "accepted", "declined"].includes(q.status)).length;
  const totalAccepted = allQuotes.filter(q => q.status === "accepted").length;
  const totalDeclined = allQuotes.filter(q => q.status === "declined").length;
  const totalValue = allQuotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedValue = allQuotes.filter(q => q.status === "accepted").reduce((sum, q) => sum + q.total, 0);
  
  // Rates
  const conversionRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0;
  const viewRate = totalSent > 0 ? Math.round((totalViewed / totalSent) * 100) : 0;
  const avgQuoteValue = totalQuotes > 0 ? Math.round(totalValue / totalQuotes) : 0;
  const avgAcceptedValue = totalAccepted > 0 ? Math.round(acceptedValue / totalAccepted) : 0;

  // ===== PERIOD COMPARISONS =====
  const currentQuoteCount = currentPeriodQuotes.length;
  const previousQuoteCount = previousPeriodQuotes.length;
  const quoteCountChange = previousQuoteCount > 0 
    ? Math.round(((currentQuoteCount - previousQuoteCount) / previousQuoteCount) * 100) 
    : currentQuoteCount > 0 ? 100 : 0;

  const currentValue = currentPeriodQuotes.reduce((sum, q) => sum + q.total, 0);
  const previousValue = previousPeriodQuotes.reduce((sum, q) => sum + q.total, 0);
  const valueChange = previousValue > 0 
    ? Math.round(((currentValue - previousValue) / previousValue) * 100) 
    : currentValue > 0 ? 100 : 0;

  const currentAccepted = currentPeriodQuotes.filter(q => q.status === "accepted").length;
  const previousAccepted = previousPeriodQuotes.filter(q => q.status === "accepted").length;
  const acceptedChange = previousAccepted > 0 
    ? Math.round(((currentAccepted - previousAccepted) / previousAccepted) * 100) 
    : currentAccepted > 0 ? 100 : 0;

  // ===== FUNNEL DATA =====
  const funnelData = {
    draft: allQuotes.filter(q => q.status === "draft").length,
    sent: allQuotes.filter(q => q.status === "sent").length,
    viewed: allQuotes.filter(q => q.status === "viewed").length,
    accepted: totalAccepted,
    declined: totalDeclined,
  };

  // ===== TIME TO ACCEPT =====
  const acceptedQuotes = allQuotes.filter(q => q.status === "accepted" && q.sent_at && q.accepted_at);
  let avgTimeToAccept = 0;
  if (acceptedQuotes.length > 0) {
    const totalHours = acceptedQuotes.reduce((sum, q) => {
      const sentDate = new Date(q.sent_at!);
      const acceptedDate = new Date(q.accepted_at!);
      return sum + (acceptedDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60);
    }, 0);
    avgTimeToAccept = Math.round(totalHours / acceptedQuotes.length);
  }

  // ===== TOP CUSTOMERS =====
  const customerStats = new Map<string, { name: string; count: number; value: number; accepted: number }>();
  allQuotes.forEach(q => {
    const key = q.customer_id || q.customer_name;
    const existing = customerStats.get(key) || { name: q.customer_name, count: 0, value: 0, accepted: 0 };
    existing.count += 1;
    existing.value += q.total;
    if (q.status === "accepted") existing.accepted += 1;
    customerStats.set(key, existing);
  });
  const topCustomers = Array.from(customerStats.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ===== MONTHLY DATA FOR CHARTS =====
  const monthlyData: { month: string; quotes: number; value: number; accepted: number }[] = [];
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  last6Months.forEach(({ year, month }) => {
    const monthQuotes = allQuotes.filter(q => {
      const d = new Date(q.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthName = new Date(year, month).toLocaleDateString("en-GB", { month: "short" });
    monthlyData.push({
      month: monthName,
      quotes: monthQuotes.length,
      value: monthQuotes.reduce((sum, q) => sum + q.total, 0),
      accepted: monthQuotes.filter(q => q.status === "accepted").length,
    });
  });

  // ===== STATUS BREAKDOWN FOR CHARTS =====
  const statusData = [
    { name: "Draft", value: funnelData.draft, color: "#94a3b8" },
    { name: "Sent", value: funnelData.sent, color: "#3b82f6" },
    { name: "Viewed", value: funnelData.viewed, color: "#f59e0b" },
    { name: "Accepted", value: funnelData.accepted, color: "#22c55e" },
    { name: "Declined", value: funnelData.declined, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const renderChange = (change: number) => {
    if (change > 0) {
      return (
        <span className="text-green-600 text-sm flex items-center gap-0.5">
          <ArrowUp className="h-3 w-3" />
          {change}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="text-red-600 text-sm flex items-center gap-0.5">
          <ArrowDown className="h-3 w-3" />
          {Math.abs(change)}%
        </span>
      );
    }
    return (
      <span className="text-surface-500 text-sm flex items-center gap-0.5">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  };

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
          <p className="text-surface-600">Track your quoting performance and trends</p>
        </div>

        {/* Period Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500">Quotes (30 days)</p>
                  <p className="text-2xl font-bold text-surface-900">{currentQuoteCount}</p>
                  <div className="mt-1">{renderChange(quoteCountChange)}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500">Value (30 days)</p>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(currentValue)}</p>
                  <div className="mt-1">{renderChange(valueChange)}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <PoundSterling className="h-5 w-5 text-brand-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500">Won (30 days)</p>
                  <p className="text-2xl font-bold text-surface-900">{currentAccepted}</p>
                  <div className="mt-1">{renderChange(acceptedChange)}</div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-surface-900">{conversionRate}%</p>
                  <p className="text-sm text-surface-500 mt-1">of sent quotes</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AnalyticsCharts monthlyData={monthlyData} statusData={statusData} />
        </div>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-surface-500" />
              Quote Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Funnel visualization */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-700">Created</span>
                    <span className="text-sm text-surface-600">{totalQuotes}</span>
                  </div>
                  <div className="h-8 bg-surface-200 rounded-lg overflow-hidden">
                    <div className="h-full bg-surface-400 rounded-lg" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-700 flex items-center gap-2">
                      <Send className="h-4 w-4 text-blue-500" />
                      Sent
                    </span>
                    <span className="text-sm text-surface-600">
                      {totalSent} ({totalQuotes > 0 ? Math.round((totalSent / totalQuotes) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-8 bg-surface-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-lg transition-all duration-500" 
                      style={{ width: `${totalQuotes > 0 ? (totalSent / totalQuotes) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-700 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-amber-500" />
                      Viewed
                    </span>
                    <span className="text-sm text-surface-600">
                      {totalViewed} ({totalSent > 0 ? Math.round((totalViewed / totalSent) * 100) : 0}% of sent)
                    </span>
                  </div>
                  <div className="h-8 bg-surface-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-lg transition-all duration-500" 
                      style={{ width: `${totalQuotes > 0 ? (totalViewed / totalQuotes) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-surface-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Accepted
                    </span>
                    <span className="text-sm text-surface-600">
                      {totalAccepted} ({totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0}% of sent)
                    </span>
                  </div>
                  <div className="h-8 bg-surface-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-lg transition-all duration-500" 
                      style={{ width: `${totalQuotes > 0 ? (totalAccepted / totalQuotes) * 100 : 0}%` }} 
                    />
                  </div>
                </div>
              </div>

              {totalDeclined > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-surface-700 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Declined
                      </span>
                      <span className="text-sm text-surface-600">
                        {totalDeclined} ({totalSent > 0 ? Math.round((totalDeclined / totalSent) * 100) : 0}% of sent)
                      </span>
                    </div>
                    <div className="h-8 bg-surface-200 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-lg transition-all duration-500" 
                        style={{ width: `${totalQuotes > 0 ? (totalDeclined / totalQuotes) * 100 : 0}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row: Performance Metrics & Top Customers */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-surface-500" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                  <div>
                    <p className="text-sm text-surface-600">Average Quote Value</p>
                    <p className="text-xl font-semibold text-surface-900">{formatCurrency(avgQuoteValue)}</p>
                  </div>
                  <PoundSterling className="h-8 w-8 text-surface-300" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                  <div>
                    <p className="text-sm text-surface-600">Average Accepted Value</p>
                    <p className="text-xl font-semibold text-surface-900">{formatCurrency(avgAcceptedValue)}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-surface-300" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                  <div>
                    <p className="text-sm text-surface-600">Average Time to Accept</p>
                    <p className="text-xl font-semibold text-surface-900">
                      {avgTimeToAccept > 24 
                        ? `${Math.round(avgTimeToAccept / 24)} days` 
                        : avgTimeToAccept > 0 
                          ? `${avgTimeToAccept} hours`
                          : "N/A"}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-surface-300" />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-50 rounded-lg">
                  <div>
                    <p className="text-sm text-surface-600">View Rate</p>
                    <p className="text-xl font-semibold text-surface-900">{viewRate}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-surface-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-surface-500" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-surface-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-brand-600 font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{customer.name}</p>
                          <p className="text-sm text-surface-500">
                            {customer.count} quote{customer.count !== 1 ? "s" : ""} • {customer.accepted} won
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-surface-900">{formatCurrency(customer.value)}</p>
                        <p className="text-sm text-surface-500">total value</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600">No customer data yet</p>
                  <p className="text-sm text-surface-500">Create quotes to see your top customers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All-Time Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-surface-500" />
              All-Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-surface-900">{totalQuotes}</p>
                <p className="text-sm text-surface-600">Total Quotes</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-surface-900">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-surface-600">Total Value</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(acceptedValue)}</p>
                <p className="text-sm text-surface-600">Won Value</p>
              </div>
              <div className="text-center p-4">
                <p className="text-3xl font-bold text-surface-900">{conversionRate}%</p>
                <p className="text-sm text-surface-600">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
