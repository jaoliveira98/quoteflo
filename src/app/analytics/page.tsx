import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Minus,
  Target,
  Zap
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
  
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, status, total, created_at, sent_at, viewed_at, accepted_at, customer_name, customer_id")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  
  const allQuotes: QuoteWithDates[] = (quotes || []).map(q => ({
    ...q,
    total: Number(q.total) || 0
  }));

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const currentPeriodQuotes = allQuotes.filter(q => new Date(q.created_at) >= thirtyDaysAgo);
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
      bg: "bg-brand-50",
      border: "border-l-brand-500",
    },
    {
      label: "Average Accepted Value",
      value: formatCurrency(avgAcceptedValue),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-l-green-500",
    },
    {
      label: "Average Time to Accept",
      value: avgTimeToAccept > 24 
        ? `${Math.round(avgTimeToAccept / 24)} days` 
        : avgTimeToAccept > 0 
          ? `${avgTimeToAccept} hours`
          : "N/A",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-l-blue-500",
    },
    {
      label: "View Rate",
      value: `${viewRate}%`,
      icon: Eye,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-l-amber-500",
    },
  ];

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-6">
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
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-surface-500">Quotes</p>
                  <p className="text-2xl font-bold text-surface-900 tracking-tight">{currentQuoteCount}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-surface-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(quoteCountChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-surface-500">Value</p>
                  <p className="text-2xl font-bold text-surface-900 tracking-tight">{formatCurrency(currentValue)}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <PoundSterling className="h-5 w-5 text-brand-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(valueChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-surface-500">Won</p>
                  <p className="text-2xl font-bold text-surface-900 tracking-tight">{currentAccepted}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {renderChange(acceptedChange)}
                <span className="text-xs text-surface-400">vs prev. period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-surface-500">Win Rate</p>
                  <p className="text-2xl font-bold text-surface-900 tracking-tight">{conversionRate}%</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs text-surface-400">of {totalSent} sent quotes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <AnalyticsCharts monthlyData={monthlyData} statusData={statusData} />
        </div>

        {/* Funnel + Performance Metrics */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Quote Funnel */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-surface-600" />
                </div>
                Quote Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className={`h-7 w-7 rounded-lg ${step.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                        </div>
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="text-sm font-medium text-surface-700">{step.label}</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-surface-900">{step.count}</span>
                            <span className="text-xs text-surface-400">{step.percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-10">
                        <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${step.bar} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${step.percentage}%`, minWidth: step.count > 0 ? "4px" : "0" }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-surface-600" />
                </div>
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border-l-[3px] ${metric.border} bg-surface-50/80`}
                    >
                      <div className={`h-9 w-9 rounded-lg ${metric.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${metric.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-500 leading-none mb-1">{metric.label}</p>
                        <p className="text-lg font-semibold text-surface-900 leading-tight truncate">{metric.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-surface-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-surface-600" />
              </div>
              Top Customers by Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-2">
                {topCustomers.map((customer, index) => {
                  const maxCustomerValue = topCustomers[0]?.value || 1;
                  const barWidth = (customer.value / maxCustomerValue) * 100;
                  return (
                    <div 
                      key={index}
                      className="group relative flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-bold text-surface-300 w-5 text-right tabular-nums">
                          {index + 1}
                        </span>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                          <span className="text-brand-700 font-semibold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-surface-900 truncate">{customer.name}</p>
                          <p className="font-semibold text-surface-900 ml-4 flex-shrink-0">{formatCurrency(customer.value)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-400 rounded-full transition-all duration-500"
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
                <div className="h-14 w-14 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-surface-300" />
                </div>
                <p className="font-medium text-surface-700 mb-1">No customer data yet</p>
                <p className="text-sm text-surface-500">Create quotes to see your top customers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All-Time Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-gradient-to-br from-surface-800 to-surface-900 p-5 text-white shadow-medium">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-surface-400" />
              <p className="text-sm font-medium text-surface-300">All-Time Quotes</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">{totalQuotes}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-surface-800 to-surface-900 p-5 text-white shadow-medium">
            <div className="flex items-center gap-2 mb-3">
              <PoundSterling className="h-4 w-4 text-surface-400" />
              <p className="text-sm font-medium text-surface-300">Total Value</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(totalValue)}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-5 text-white shadow-medium">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-green-200" />
              <p className="text-sm font-medium text-green-100">Won Value</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(acceptedValue)}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-medium">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-brand-200" />
              <p className="text-sm font-medium text-brand-100">Win Rate</p>
            </div>
            <p className="text-2xl font-bold tracking-tight">{conversionRate}%</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
