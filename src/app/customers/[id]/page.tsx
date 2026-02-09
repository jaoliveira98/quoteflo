import { DashboardShell } from "@/components/dashboard-shell";
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
import { requireAuthWithProfile } from "@/lib/auth";
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

  if (error || !customer) {
    notFound();
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("customer_id", id)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const customerQuotes = quotes || [];

  const totalQuotes = customerQuotes.length;
  const acceptedQuotes = customerQuotes.filter(q => q.status === "accepted").length;
  const totalValue = customerQuotes.reduce((sum, q) => sum + (Number(q.total) || 0), 0);
  const acceptedValue = customerQuotes
    .filter(q => q.status === "accepted")
    .reduce((sum, q) => sum + (Number(q.total) || 0), 0);

  const allEmails = [
    ...(customer.email ? [customer.email] : []),
    ...(customer.emails || []),
  ].filter((e, i, arr) => e && arr.indexOf(e) === i);

  const allPhones = [
    ...(customer.phone ? [customer.phone] : []),
    ...(customer.phones || []),
  ].filter((p, i, arr) => p && arr.indexOf(p) === i);

  const { data: otherCustomers } = await supabase
    .from("customers")
    .select("id, name, email")
    .eq("user_id", profile.id)
    .neq("id", id)
    .order("name");

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild aria-label="Back to customers">
              <Link href="/customers">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-brand-700">
                  {getInitials(customer.name)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">{customer.name}</h1>
                <p className="text-surface-600">
                  Customer since {new Date(customer.created_at).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/quotes/new?customer=${customer.id}`}>
                <Plus className="h-4 w-4" />
                New Quote
              </Link>
            </Button>
            <CustomerActions 
              customer={customer} 
              otherCustomers={otherCustomers || []} 
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Quotes</p>
                  <p className="text-2xl font-bold text-surface-900">{totalQuotes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Won</p>
                  <p className="text-2xl font-bold text-surface-900">{acceptedQuotes}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Total Quoted</p>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(totalValue)}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                  <PoundSterling className="h-5 w-5 text-surface-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-500">Won Value</p>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(acceptedValue)}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Quote History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerQuotes.length > 0 ? (
                <div className="space-y-3">
                  {customerQuotes.map((quote) => {
                    const StatusIcon = STATUS_ICONS[quote.status as QuoteStatus] || FileText;
                    return (
                      <Link
                        key={quote.id}
                        href={`/quotes/${quote.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-surface-200 hover:border-surface-300 hover:bg-surface-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                            <StatusIcon className="h-5 w-5 text-surface-500" />
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{quote.quote_number}</p>
                            <div className="flex items-center gap-2 text-sm text-surface-500">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(quote.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                              {quote.job_description && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[200px]">{quote.job_description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={STATUS_COLORS[quote.status as QuoteStatus]}>
                            {STATUS_LABELS[quote.status as QuoteStatus]}
                          </Badge>
                          <span className="font-semibold text-surface-900">
                            {formatCurrency(Number(quote.total))}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-600 mb-4">No quotes yet</p>
                  <Button asChild>
                    <Link href={`/quotes/new?customer=${customer.id}`}>
                      <Plus className="h-4 w-4" />
                      Create First Quote
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
