import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { formatCurrency, formatDateLong, escapeHtml } from "@/lib/utils";
import type { Quote, QuoteLineItem, UserProfile } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const { data, error } = await supabase.rpc("get_public_quote_data", {
    p_token: token,
  });

  if (error || !data) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const { quote, line_items, profile } = data as {
    quote: Quote;
    line_items: QuoteLineItem[];
    profile: UserProfile | null;
  };

  const html = generateQuoteHTML(quote, line_items || [], profile);

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
  const brandColor = escapeHtml(profile?.brand_color || "#22c55e");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote ${escapeHtml(quote.quote_number)}</title>
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
      border-bottom: 2px solid ${brandColor};
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
      color: ${brandColor};
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
      color: ${brandColor};
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
      <div class="company-name">${escapeHtml(profile?.company_name || "Company Name")}</div>
      ${profile?.phone ? `<p>${escapeHtml(profile.phone)}</p>` : ""}
      ${profile?.email ? `<p>${escapeHtml(profile.email)}</p>` : ""}
    </div>
    <div class="quote-title">
      <h1>QUOTE</h1>
      <div class="quote-number">${escapeHtml(quote.quote_number)}</div>
    </div>
  </div>

  <div class="details-grid">
    <div class="detail-section">
      <h3>Quote For</h3>
      <p class="name">${escapeHtml(quote.customer_name)}</p>
      ${quote.customer_email ? `<p>${escapeHtml(quote.customer_email)}</p>` : ""}
      ${quote.customer_phone ? `<p>${escapeHtml(quote.customer_phone)}</p>` : ""}
      ${quote.customer_address ? `<p>${escapeHtml(quote.customer_address)}</p>` : ""}
      ${quote.customer_postcode ? `<p>${escapeHtml(quote.customer_postcode)}</p>` : ""}
    </div>
    <div class="detail-section" style="text-align: right;">
      <h3>Quote Date</h3>
      <p>${formatDateLong(quote.created_at)}</p>
      ${quote.valid_until ? `
        <h3 style="margin-top: 16px;">Valid Until</h3>
        <p>${formatDateLong(quote.valid_until)}</p>
      ` : ""}
    </div>
  </div>

  ${quote.job_description ? `
    <div class="job-description">
      <h3>Job Description</h3>
      <p>${escapeHtml(quote.job_description)}</p>
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
          <td>${escapeHtml(item.description)}</td>
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
    ${Number(quote.vat_amount) > 0 ? `
    <div class="totals-row">
      <span>VAT (${quote.vat_rate}%)</span>
      <span>${formatCurrency(Number(quote.vat_amount))}</span>
    </div>
    ` : ""}
    <div class="totals-row total">
      <span>Total</span>
      <span class="amount">${formatCurrency(Number(quote.total))}</span>
    </div>
  </div>

  ${quote.valid_until ? `
    <div class="valid-until">
      This quote is valid until <strong>${formatDateLong(quote.valid_until)}</strong>
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
        <p>Contact us at ${escapeHtml(profile?.phone || "the number above")} or reply to this quote.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
