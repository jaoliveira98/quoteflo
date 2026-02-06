import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Send,
  Edit,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Bell
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CONFIG } from "@/lib/constants";
import type { QuoteStatus } from "@/types";
import { QuoteDetailActions } from "./quote-detail-actions";
import { DeleteQuoteCard } from "./delete-quote-card";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (error || !quote) {
    notFound();
  }

  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("item_order", { ascending: true });

  const status = STATUS_CONFIG[quote.status as QuoteStatus] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" asChild aria-label="Back to quotes">
                <Link href="/quotes">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-surface-900">{quote.quote_number}</h1>
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-surface-600">
                  Created {formatDate(quote.created_at)}
                  {quote.valid_until && (
                    <> • Valid until {formatDate(quote.valid_until)}</>
                  )}
                </p>
              </div>
            </div>
            
            <QuoteDetailActions 
              quoteId={quote.id} 
              status={quote.status}
              accessToken={quote.access_token}
              hasEmail={!!quote.customer_email}
              followUpCount={quote.follow_up_count || 0}
              lastFollowUpAt={quote.last_follow_up_at}
            />
          </div>
        </div>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-surface-900">{quote.customer_name}</p>
                <div className="mt-2 space-y-1 text-surface-600">
                  {quote.customer_email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-surface-400" />
                      {quote.customer_email}
                    </p>
                  )}
                  {quote.customer_phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-surface-400" />
                      {quote.customer_phone}
                    </p>
                  )}
                  {(quote.customer_address || quote.customer_postcode) && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-surface-400" />
                      {[quote.customer_address, quote.customer_postcode].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        {quote.job_description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-surface-700 whitespace-pre-wrap">{quote.job_description}</p>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quote Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lineItems && lineItems.length > 0 ? (
                <>
                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 text-sm font-medium text-surface-500 px-4 pb-2 border-b border-surface-200">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  
                  {/* Items */}
                  {lineItems.map((item) => (
                    <div 
                      key={item.id}
                      className="grid grid-cols-12 gap-4 p-4 rounded-lg bg-surface-50 items-center"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <p className="font-medium text-surface-900">{item.description}</p>
                      </div>
                      <div className="col-span-4 sm:col-span-2 text-left sm:text-right">
                        <span className="sm:hidden text-sm text-surface-500 mr-2">Qty:</span>
                        {item.quantity}
                      </div>
                      <div className="col-span-4 sm:col-span-2 text-left sm:text-right">
                        <span className="sm:hidden text-sm text-surface-500 mr-2">@</span>
                        {formatCurrency(Number(item.unit_price))}
                      </div>
                      <div className="col-span-4 sm:col-span-2 text-right font-medium">
                        {formatCurrency(Number(item.line_total))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-surface-500 text-center py-4">No items</p>
              )}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-surface-200">
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-8">
                  <span className="text-surface-600">Subtotal</span>
                  <span className="font-medium w-28 text-right">
                    {formatCurrency(Number(quote.subtotal))}
                  </span>
                </div>
                {Number(quote.vat_amount) > 0 && (
                  <div className="flex items-center gap-8">
                    <span className="text-surface-600">VAT ({quote.vat_rate}%)</span>
                    <span className="font-medium w-28 text-right">
                      {formatCurrency(Number(quote.vat_amount))}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-8 pt-2 border-t border-surface-200">
                  <span className="text-lg font-semibold text-surface-900">Total</span>
                  <span className="text-xl font-bold w-28 text-right text-brand-600">
                    {formatCurrency(Number(quote.total))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity / Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quote.accepted_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Quote accepted</p>
                    <p className="text-surface-500">{formatDate(quote.accepted_at)}</p>
                  </div>
                </div>
              )}
              {quote.expiry_reminder_sent_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Expiry reminder sent</p>
                    <p className="text-surface-500">{formatDate(quote.expiry_reminder_sent_at)}</p>
                  </div>
                </div>
              )}
              {quote.last_follow_up_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">
                      Follow-up #{quote.follow_up_count || 1} sent
                    </p>
                    <p className="text-surface-500">{formatDate(quote.last_follow_up_at)}</p>
                  </div>
                </div>
              )}
              {quote.viewed_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Quote viewed</p>
                    <p className="text-surface-500">{formatDate(quote.viewed_at)}</p>
                  </div>
                </div>
              )}
              {quote.sent_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Send className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Quote sent</p>
                    <p className="text-surface-500">{formatDate(quote.sent_at)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-surface-100 flex items-center justify-center">
                  <Edit className="h-4 w-4 text-surface-600" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">Quote created</p>
                  <p className="text-surface-500">{formatDate(quote.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <DeleteQuoteCard quoteId={quote.id} />
      </div>
    </DashboardShell>
  );
}
