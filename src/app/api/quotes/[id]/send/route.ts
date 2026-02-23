import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { formatCurrency, escapeHtml } from "@/lib/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (quoteError || !quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (!quote.customer_email) {
    return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("item_order", { ascending: true });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const quoteUrl = `${baseUrl}/q/${quote.access_token}`;

  const brandColor = escapeHtml(profile?.brand_color || "#22c55e");
  const companyName = escapeHtml(profile?.company_name || "Quote");

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${brandColor};">
    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${companyName}</h1>
  </div>
  
  <div style="padding: 30px 0;">
    <p style="margin: 0 0 20px;">Hi ${escapeHtml(quote.customer_name.split(" ")[0])},</p>
    
    <p style="margin: 0 0 20px;">Thank you for your enquiry. Please find your quote below:</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Quote Number:</strong> ${escapeHtml(quote.quote_number)}</p>
      ${quote.job_description ? `<p style="margin: 0 0 10px;"><strong>Job:</strong> ${escapeHtml(quote.job_description)}</p>` : ""}
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandColor};">Total: ${formatCurrency(Number(quote.total))}</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">(inc. VAT)</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${quoteUrl}" style="display: inline-block; background: ${brandColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Full Quote</a>
    </div>
    
    <p style="margin: 0 0 10px;">Click the button above to:</p>
    <ul style="margin: 0 0 20px; padding-left: 20px;">
      <li>View the full quote breakdown</li>
      <li>Accept the quote online</li>
      <li>Ask any questions</li>
    </ul>
    
    ${quote.valid_until ? `
      <p style="margin: 0; padding: 15px; background: #fef3c7; border-radius: 8px; color: #92400e; text-align: center;">
        This quote is valid until <strong>${escapeHtml(new Date(quote.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}</strong>
      </p>
    ` : ""}
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #64748b;">
    <p style="margin: 0;">Best regards,</p>
    <p style="margin: 5px 0 0; font-weight: 600; color: #1e293b;">${companyName}</p>
    ${profile?.phone ? `<p style="margin: 5px 0 0;">${escapeHtml(profile.phone)}</p>` : ""}
  </div>
</body>
</html>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: `${profile?.company_name || "QuoteFlo"} <quotes@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
        to: quote.customer_email,
        subject: `Quote ${quote.quote_number} from ${profile?.company_name || "us"}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } else {
    console.log("Resend not configured - email would be sent to:", quote.customer_email);
    console.log("Quote URL:", quoteUrl);
  }

  await supabase
    .from("quotes")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", quote.id);

  return NextResponse.json({ 
    success: true, 
    message: resend ? "Quote sent successfully" : "Quote marked as sent (email not configured)",
    quoteUrl 
  });
}
