import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardNavLink } from "@/components/dashboard-nav-link";
import { NewQuoteButton } from "@/components/new-quote-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  PoundSterling,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, getInitials } from "@/lib/utils";
import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS } from "@/lib/constants";
import type { QuoteStatus } from "@/types";
import { CustomerActions } from "./customer-actions";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (error || !customer) notFound();

  const [quotesResult, otherCustomersResult] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, quote_number, status, total, created_at, job_description")
      .eq("customer_id", id)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("customers")
      .select("id, name, email")
      .eq("user_id", profile.id)
      .neq("id", id)
      .order("name"),
  ]);

  const customerQuotes = quotesResult.data ?? [];
  const otherCustomers = otherCustomersResult.data ?? [];

  const totalQuotes = customerQuotes.length;
  const acceptedQuotes = customerQuotes.filter((q) => q.status === "accepted").length;
  const totalValue = customerQuotes.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const acceptedValue = customerQuotes
    .filter((q) => q.status === "accepted")
    .reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  const allEmails = [
    ...(customer.email ? [customer.email] : []),
    ...(customer.emails || []),
  ].filter((e, i, arr) => e && arr.indexOf(e) === i);

  const allPhones = [
    ...(customer.phone ? [customer.phone] : []),
    ...(customer.phones || []),
  ].filter((p, i, arr) => p && arr.indexOf(p) === i);

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" asChild aria-label="Back to customers" className="flex-shrink-0">
                <Link href="/customers">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl font-semibold text-brand-700">
                    {getInitials(customer.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-surface-900 truncate">{customer.name}</h1>
                  <p className="text-sm sm:text-base text-surface-600">
                    Customer since {new Date(customer.created_at).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <NewQuoteButton href={`/quotes/new?customer=${customer.id}`}>
                <Plus className="h-4 w-4" />
                New Quote
              </NewQuoteButton>
              <CustomerActions
                customer={customer}
                otherCustomers={otherCustomers}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 min-h-[3.5rem]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-surface-500">Total Quotes</p>
                  <p className="text-xl sm:text-2xl font-bold text-surface-900 break-all">{totalQuotes}</p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 min-h-[3.5rem]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-surface-500">Won</p>
                  <p className="text-xl sm:text-2xl font-bold text-surface-900 break-all">{acceptedQuotes}</p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 min-h-[3.5rem]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-surface-500">Total Quoted</p>
                  <p className="text-xl sm:text-2xl font-bold text-surface-900 break-all">{formatCurrency(totalValue)}</p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <PoundSterling className="h-4 w-4 sm:h-5 sm:w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 min-h-[3.5rem]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-surface-500">Won Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-surface-900 break-all">{formatCurrency(acceptedValue)}</p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Emails */}
              <div>
                <p className="text-sm font-medium text-surface-500 mb-2">Email</p>
                {allEmails.length > 0 ? (
                  <div className="space-y-2">
                    {allEmails.map((email, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-surface-400" />
                        <a 
                          href={`mailto:${email}`}
                          className="text-brand-600 hover:underline"
                        >
                          {email}
                        </a>
                        {i === 0 && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-surface-400 text-sm">No email address</p>
                )}
              </div>

              {/* Phones */}
              <div>
                <p className="text-sm font-medium text-surface-500 mb-2">Phone</p>
                {allPhones.length > 0 ? (
                  <div className="space-y-2">
                    {allPhones.map((phone, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-surface-400" />
                        <a 
                          href={`tel:${phone}`}
                          className="text-brand-600 hover:underline"
                        >
                          {phone}
                        </a>
                        {i === 0 && <Badge variant="secondary" className="text-xs">Primary</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-surface-400 text-sm">No phone number</p>
                )}
              </div>

              {/* Address */}
              <div>
                <p className="text-sm font-medium text-surface-500 mb-2">Address</p>
                {customer.address || customer.postcode ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-surface-400 mt-0.5" />
                    <div>
                      {customer.address && <p className="text-surface-700">{customer.address}</p>}
                      {customer.postcode && <p className="text-surface-700">{customer.postcode}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-surface-400 text-sm">No address</p>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div>
                  <p className="text-sm font-medium text-surface-500 mb-2">Notes</p>
                  <p className="text-surface-700 text-sm whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote History */}
          <Card className="lg:col-span-2 min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Quote History</CardTitle>
            </CardHeader>
            <CardContent className="min-w-0">
              {customerQuotes.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {customerQuotes.map((quote) => {
                    const StatusIcon = STATUS_ICONS[quote.status as QuoteStatus] || FileText;
                    return (
                      <DashboardNavLink
                        key={quote.id}
                        href={`/quotes/${quote.id}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-colors min-w-0"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                            <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-surface-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-surface-900 truncate">{quote.quote_number}</p>
                            <div className="flex items-center gap-2 text-sm text-surface-500 flex-wrap">
                              <span className="flex items-center gap-1.5 shrink-0">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(quote.created_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {quote.job_description && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{quote.job_description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                          <Badge variant={STATUS_COLORS[quote.status as QuoteStatus]}>
                            {STATUS_LABELS[quote.status as QuoteStatus]}
                          </Badge>
                          <span className="font-semibold text-surface-900">
                            {formatCurrency(Number(quote.total))}
                          </span>
                        </div>
                      </DashboardNavLink>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600 mb-4">No quotes yet</p>
                  <NewQuoteButton href={`/quotes/new?customer=${customer.id}`}>
                    <Plus className="h-4 w-4" />
                    Create First Quote
                  </NewQuoteButton>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
