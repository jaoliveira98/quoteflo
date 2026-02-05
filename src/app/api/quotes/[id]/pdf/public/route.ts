import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Quote, QuoteLineItem, UserProfile } from "@/types";

// Create a public Supabase client (no auth required)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch quote (public access via RLS policy)
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Fetch line items
  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("item_order", { ascending: true });

  // Fetch user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", quote.user_id)
    .single();

  // Generate HTML for PDF
  const html = generateQuoteHTML(quote as Quote, (lineItems || []) as QuoteLineItem[], profile as UserProfile | null);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

function generateQuoteHTML(
  quote: Quote,
  lineItems: QuoteLineItem[],
  profile: UserProfile | null
) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote ${quote.quote_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #1e293b;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #22c55e;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .quote-title {
      text-align: right;
    }
    .quote-title h1 {
      font-size: 28px;
      font-weight: 700;
      color: #22c55e;
    }
    .quote-number {
      font-size: 16px;
      color: #64748b;
      margin-top: 4px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .detail-section h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    .detail-section p {
      color: #1e293b;
    }
    .detail-section .name {
      font-weight: 600;
      font-size: 16px;
    }
    .job-description {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .job-description h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      padding: 12px;
      background: #f1f5f9;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    th:last-child {
      text-align: right;
    }
    td {
      padding: 16px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .totals {
      margin-left: auto;
      width: 280px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .totals-row.total {
      border-top: 2px solid #1e293b;
      margin-top: 8px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
    }
    .totals-row.total .amount {
      color: #22c55e;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .footer h4 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 8px;
    }
    .footer p {
      font-size: 13px;
      color: #475569;
    }
    .valid-until {
      background: #fef3c7;
      color: #92400e;
      padding: 12px 16px;
      border-radius: 8px;
      text-align: center;
      margin-top: 40px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .header {
        margin-bottom: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">${profile?.company_name || "Company Name"}</div>
      ${profile?.phone ? `<p>${profile.phone}</p>` : ""}
      ${profile?.email ? `<p>${profile.email}</p>` : ""}
    </div>
    <div class="quote-title">
      <h1>QUOTE</h1>
      <div class="quote-number">${quote.quote_number}</div>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-section">
      <h3>Quote For</h3>
      <p class="name">${quote.customer_name}</p>
      ${quote.customer_email ? `<p>${quote.customer_email}</p>` : ""}
      ${quote.customer_phone ? `<p>${quote.customer_phone}</p>` : ""}
      ${quote.customer_address ? `<p>${quote.customer_address}</p>` : ""}
      ${quote.customer_postcode ? `<p>${quote.customer_postcode}</p>` : ""}
    </div>
    <div class="detail-section" style="text-align: right;">
      <h3>Quote Date</h3>
      <p>${formatDate(quote.created_at)}</p>
      ${quote.valid_until ? `
        <h3 style="margin-top: 16px;">Valid Until</h3>
        <p>${formatDate(quote.valid_until)}</p>
      ` : ""}
    </div>
  </div>

  ${quote.job_description ? `
    <div class="job-description">
      <h3>Job Description</h3>
      <p>${quote.job_description}</p>
    </div>
  ` : ""}

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="width: 80px; text-align: center;">Qty</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 100px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatCurrency(Number(item.unit_price))}</td>
          <td>${formatCurrency(Number(item.line_total))}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${formatCurrency(Number(quote.subtotal))}</span>
    </div>
    <div class="totals-row">
      <span>VAT (${quote.vat_rate}%)</span>
      <span>${formatCurrency(Number(quote.vat_amount))}</span>
    </div>
    <div class="totals-row total">
      <span>Total</span>
      <span class="amount">${formatCurrency(Number(quote.total))}</span>
    </div>
  </div>

  ${quote.valid_until ? `
    <div class="valid-until">
      This quote is valid until <strong>${formatDate(quote.valid_until)}</strong>
    </div>
  ` : ""}

  <div class="footer">
    <div class="footer-grid">
      <div>
        <h4>Terms & Conditions</h4>
        <p>Payment due within 14 days of job completion. All prices include materials unless otherwise stated.</p>
      </div>
      <div>
        <h4>Questions?</h4>
        <p>Contact us at ${profile?.phone || "the number above"} or reply to this quote.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
