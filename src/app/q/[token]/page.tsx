import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Download
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuoteActions } from "./quote-actions";
import { DownloadPDFButton } from "./download-pdf-button";
import { MarkViewed } from "./mark-viewed";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const { data: quote, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("access_token", token)
    .single();

  if (error || !quote) {
    notFound();
  }

  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("item_order", { ascending: true });

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("company_name, phone, email, trade, logo_url, brand_color")
    .eq("id", quote.user_id)
    .single();

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();
  const isAccepted = quote.status === "accepted";
  const isDeclined = quote.status === "declined";

  return (
    <div className="min-h-screen bg-surface-50">
      <MarkViewed accessToken={token} status={quote.status} viewedAt={quote.viewed_at} />
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-500">Quote from</p>
            <p className="font-semibold text-surface-900">{profile?.company_name || "Company"}</p>
          </div>
          <div className="flex items-center gap-3">
            <DownloadPDFButton quoteId={quote.id} />
            <div className="text-right">
              <p className="text-sm text-surface-500">{quote.quote_number}</p>
              {isAccepted && (
                <Badge variant="success" className="mt-1">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Accepted
                </Badge>
              )}
              {isExpired && !isAccepted && (
                <Badge variant="secondary" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Quote Summary Card */}
        <Card className="overflow-hidden">
          <div 
            className="p-6 sm:p-8 text-white"
            style={{ background: `linear-gradient(135deg, ${profile?.brand_color || '#22c55e'}, ${profile?.brand_color || '#22c55e'}dd)` }}
          >
            <p className="text-sm opacity-80 mb-1">Total Quote Amount</p>
            <p className="text-3xl sm:text-4xl font-bold">{formatCurrency(Number(quote.total))}</p>
            {Number(quote.vat_amount) > 0 && (
              <p className="text-sm opacity-80 mt-1">Including VAT</p>
            )}
          </div>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-surface-500 mb-1">Quote For</p>
                <p className="font-medium text-surface-900">{quote.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-surface-500 mb-1">Valid Until</p>
                <p className="font-medium text-surface-900">
                  {quote.valid_until ? formatDate(quote.valid_until) : "No expiry"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        {quote.job_description && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-surface-400 mt-0.5" />
                <div>
                  <p className="font-medium text-surface-900 mb-1">Job Description</p>
                  <p className="text-surface-600 whitespace-pre-wrap">{quote.job_description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Quote Breakdown</h3>
            
            <div className="space-y-3">
              {lineItems && lineItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-start justify-between py-3 border-b border-surface-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-surface-900">{item.description}</p>
                    <p className="text-sm text-surface-500">
                      {item.quantity} × {formatCurrency(Number(item.unit_price))}
                    </p>
                  </div>
                  <p className="font-medium text-surface-900">
                    {formatCurrency(Number(item.line_total))}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-surface-200">
              <div className="space-y-2">
                <div className="flex justify-between text-surface-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(quote.subtotal))}</span>
                </div>
                {Number(quote.vat_amount) > 0 && (
                  <div className="flex justify-between text-surface-600">
                    <span>VAT ({quote.vat_rate}%)</span>
                    <span>{formatCurrency(Number(quote.vat_amount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold text-surface-900 pt-2 border-t border-surface-200">
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(Number(quote.total))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {!isAccepted && !isDeclined && !isExpired && (
          <QuoteActions quoteId={quote.id} token={token} />
        )}

        {isAccepted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-1">Quote Accepted</h3>
              <p className="text-green-700">
                You accepted this quote on {quote.accepted_at ? formatDate(quote.accepted_at) : "recently"}.
                {profile?.company_name} will be in touch soon.
              </p>
            </CardContent>
          </Card>
        )}

        {isExpired && !isAccepted && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-semibold text-amber-900 mb-1">Quote Expired</h3>
              <p className="text-amber-700">
                This quote expired on {formatDate(quote.valid_until)}. 
                Please contact {profile?.company_name} for an updated quote.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Company Contact */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Questions?</h3>
            <div className="space-y-3">
              <p className="text-surface-600">
                Contact <strong>{profile?.company_name}</strong> directly:
              </p>
              {profile?.phone && (
                <a 
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <Phone className="h-5 w-5 text-brand-500" />
                  <span className="font-medium text-surface-900">{profile.phone}</span>
                </a>
              )}
              {profile?.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <Mail className="h-5 w-5 text-brand-500" />
                  <span className="font-medium text-surface-900">{profile.email}</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-surface-400">
          Powered by <span className="font-medium">QuoteFlo</span>
        </p>
      </footer>
    </div>
  );
}
