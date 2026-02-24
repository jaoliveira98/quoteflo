import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Send, 
  Eye,
  CheckCircle2, 
  XCircle,
  PoundSterling,
  Clock,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Target
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { getCachedQuotesForAnalytics } from "@/lib/data/quotes";
import { AnalyticsCharts } from "./analytics-charts";

export default async function AnalyticsPage() {
  const profile = await requireAuthWithProfile();
  const rawQuotes = await getCachedQuotesForAnalytics(profile.id);

  const allQuotes = rawQuotes.map((q) => ({
    ...q,
    total: Number(q.total) || 0,
  }));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const currentPeriodQuotes = allQuotes.filter(q => new Date(q.created_at) >= thirtyDaysAgo);
  const previousPeriodQuotes = allQuotes.filter(q => {
    const date = new Date(q.created_at);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  const totalQuotes = allQuotes.length;

  const statusCounts = allQuotes.reduce(
    (acc, q) => {
      acc.totalValue += q.total;
      acc.byStatus[q.status] = (acc.byStatus[q.status] || 0) + 1;
      if (q.status !== "draft") acc.nonDraft++;
      if (["viewed", "accepted", "declined"].includes(q.status)) acc.viewedOrResolved++;
      if (q.status === "accepted") acc.acceptedValue += q.total;
      return acc;
    },
    { totalValue: 0, acceptedValue: 0, nonDraft: 0, viewedOrResolved: 0, byStatus: {} as Record<string, number> }
  );

  const totalSent = statusCounts.nonDraft;
  const totalViewed = statusCounts.viewedOrResolved;
  const totalAccepted = statusCounts.byStatus["accepted"] || 0;
  const totalDeclined = statusCounts.byStatus["declined"] || 0;
  const { totalValue, acceptedValue } = statusCounts;
  
  const conversionRate = totalSent > 0 ? Math.round((totalAccepted / totalSent) * 100) : 0;
  const viewRate = totalSent > 0 ? Math.round((totalViewed / totalSent) * 100) : 0;
  const avgQuoteValue = totalQuotes > 0 ? Math.round(totalValue / totalQuotes) : 0;
  const avgAcceptedValue = totalAccepted > 0 ? Math.round(acceptedValue / totalAccepted) : 0;

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

  const funnelData = {
    draft: statusCounts.byStatus["draft"] || 0,
    sent: statusCounts.byStatus["sent"] || 0,
    viewed: statusCounts.byStatus["viewed"] || 0,
    accepted: totalAccepted,
    declined: totalDeclined,
  };

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
        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
          <ArrowUp className="h-3 w-3" />
          {change}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full">
          <ArrowDown className="h-3 w-3" />
          {Math.abs(change)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-surface-500 bg-surface-100 px-1.5 py-0.5 rounded-full">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  };

  const funnelSteps = [
    { 
      label: "Created", 
      count: totalQuotes, 
      percentage: 100,
      icon: FileText,
      color: "text-surface-600",
      bg: "bg-surface-100",
      bar: "bg-surface-400" 
    },
    { 
      label: "Sent", 
      count: totalSent, 
      percentage: totalQuotes > 0 ? Math.round((totalSent / totalQuotes) * 100) : 0,
      icon: Send,
      color: "text-blue-600",
      bg: "bg-blue-50",
      bar: "bg-blue-500" 
    },
    { 
      label: "Viewed", 
      count: totalViewed, 
      percentage: totalQuotes > 0 ? Math.round((totalViewed / totalQuotes) * 100) : 0,
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-50",
      bar: "bg-amber-500" 
    },
    { 
      label: "Accepted", 
      count: totalAccepted, 
      percentage: totalQuotes > 0 ? Math.round((totalAccepted / totalQuotes) * 100) : 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      bar: "bg-green-500" 
    },
    ...(totalDeclined > 0 ? [{
      label: "Declined", 
      count: totalDeclined, 
      percentage: totalQuotes > 0 ? Math.round((totalDeclined / totalQuotes) * 100) : 0,
      icon: XCircle,
      color: "text-red-600" as const,
      bg: "bg-red-50" as const,
      bar: "bg-red-500" as const
    }] : []),
  ];

  const performanceMetrics = [
    {
      label: "Average Quote Value",
      value: formatCurrency(avgQuoteValue),
      icon: PoundSterling,
      color: "text-brand-600",
      bg: "bg-brand-100",
    },
    {
      label: "Average Accepted Value",
      value: formatCurrency(avgAcceptedValue),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Average Time to Accept",
      value: avgTimeToAccept > 24 
        ? `${Math.round(avgTimeToAccept / 24)} days` 
        : avgTimeToAccept > 0 
          ? `${avgTimeToAccept} hours`
          : "No data available",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "View Rate",
      value: `${viewRate}%`,
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
            <p className="text-surface-500 mt-1">Track your quoting performance and trends</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Calendar className="h-4 w-4" />
            <span>Last 30 days vs previous 30 days</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Quotes</p>
                  <p className="text-2xl font-bold text-surface-900">{currentQuoteCount}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-surface-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(quoteCountChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Value</p>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(currentValue)}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <PoundSterling className="h-5 w-5 text-brand-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(valueChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Won</p>
                  <p className="text-2xl font-bold text-surface-900">{currentAccepted}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(acceptedChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Win Rate</p>
                  <p className="text-2xl font-bold text-surface-900">{conversionRate}%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-surface-400">of {totalSent} sent quotes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <AnalyticsCharts monthlyData={monthlyData} statusData={statusData} />

        {/* Funnel + Performance Metrics */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Quote Funnel */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Quote Funnel</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {funnelSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-4 w-4 ${step.color}`} />
                          </div>
                          <span className="text-sm font-medium text-surface-700">{step.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-surface-900">{step.count}</span>
                          <span className="text-xs text-surface-400">{step.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${step.bar} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${step.percentage}%`, minWidth: step.count > 0 ? "4px" : "0" }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              {performanceMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg ${metric.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-4 w-4 ${metric.color}`} />
                        </div>
                        <span className="text-sm text-surface-600">{metric.label}</span>
                      </div>
                      <span className="text-lg font-semibold text-surface-900">{metric.value}</span>
                    </div>
                    {index < performanceMetrics.length - 1 && (
                      <div className="border-t border-surface-200 mt-4" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Top Customers by Value</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => {
                  const maxCustomerValue = topCustomers[0]?.value || 1;
                  const barWidth = (customer.value / maxCustomerValue) * 100;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-all"
                    >
                      <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 font-semibold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-surface-900 truncate">{customer.name}</p>
                          <p className="font-medium text-surface-900 ml-4 flex-shrink-0">{formatCurrency(customer.value)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-surface-500 flex-shrink-0">
                            {customer.count} quote{customer.count !== 1 ? "s" : ""} · {customer.accepted} won
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="h-16 w-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-surface-300" />
                </div>
                <p className="font-semibold text-surface-900 mb-1">No customer data yet</p>
                <p className="text-sm text-surface-500">Create quotes to see your top customers</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}
