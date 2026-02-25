import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { formatCurrency, escapeHtml } from "@/lib/utils";
import { hasActiveSubscription } from "@/lib/auth";
import type { UserProfile } from "@/types";
import { getQuotesListCacheTag } from "@/lib/data/quotes";
import { getQuotesStatsCacheTag } from "@/lib/data/customers";
import { getAppUrl } from "@/lib/url";

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

  if (quote.status === "accepted" || quote.status === "declined") {
    return NextResponse.json({ error: "Cannot send follow-up for accepted or declined quotes" }, { status: 400 });
  }

  if (quote.status === "draft") {
    return NextResponse.json({ error: "Quote must be sent before sending follow-up" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !hasActiveSubscription(profile as UserProfile)) {
    return NextResponse.json(
      { error: "Active subscription required. Please upgrade to QuoteFlo Pro." },
      { status: 403 }
    );
  }

  const quoteUrl = `${getAppUrl()}/q/${quote.access_token}`;

  // Determine follow-up message based on count
  const followUpNumber = (quote.follow_up_count || 0) + 1;
  let followUpMessage = "";
  let subjectLine = "";

  if (followUpNumber === 1) {
    subjectLine = `Checking in: Quote ${quote.quote_number}`;
    followUpMessage = `
      <p style="margin: 0 0 20px;">I wanted to follow up on the quote I sent you recently. I know you're busy, so just wanted to make sure it didn't get lost in your inbox!</p>
      <p style="margin: 0 0 20px;">If you have any questions about the quote or would like to discuss anything, please don't hesitate to get in touch.</p>
    `;
  } else if (followUpNumber === 2) {
    subjectLine = `Quick reminder: Quote ${quote.quote_number}`;
    followUpMessage = `
      <p style="margin: 0 0 20px;">Just a gentle reminder about the quote I sent you. I'd love to help you get this work done.</p>
      <p style="margin: 0 0 20px;">If this isn't the right time, no worries at all – just let me know and I'll check back in later.</p>
    `;
  } else {
    subjectLine = `Final follow-up: Quote ${quote.quote_number}`;
    followUpMessage = `
      <p style="margin: 0 0 20px;">This will be my last follow-up about this quote. If you're no longer interested, that's absolutely fine – I appreciate you considering us!</p>
      <p style="margin: 0 0 20px;">If you'd still like to go ahead at any point, the quote will remain valid${quote.valid_until ? ` until ${new Date(quote.valid_until).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}` : ""}.</p>
    `;
  }

  const brandColor = escapeHtml(profile?.brand_color || "#22c55e");
  const companyName = escapeHtml(profile?.company_name || "The Team");
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${brandColor};">
    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${escapeHtml(profile?.company_name || "Quote")}</h1>
  </div>
  
  <div style="padding: 30px 0;">
    <p style="margin: 0 0 20px;">Hi ${escapeHtml(quote.customer_name.split(" ")[0])},</p>
    
    ${followUpMessage}
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Quote Number:</strong> ${escapeHtml(quote.quote_number)}</p>
      ${quote.job_description ? `<p style="margin: 0 0 10px;"><strong>Job:</strong> ${escapeHtml(quote.job_description)}</p>` : ""}
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandColor};">Total: ${formatCurrency(Number(quote.total))}</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">(inc. VAT)</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${quoteUrl}" style="display: inline-block; background: ${brandColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Quote</a>
    </div>
    
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
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
    <p style="margin: 0;">You received this email because a quote was sent to you.</p>
  </div>
</body>
</html>
  `;

  let emailSent = false;

  if (resend) {
    try {
      await resend.emails.send({
        from: `${profile?.company_name || "QuoteFlo"} <quotes@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
        to: quote.customer_email,
        subject: subjectLine,
        html: emailHtml,
      });
      emailSent = true;
    } catch (emailError) {
      console.error("Email send error:", emailError);
      
      // Log the failed notification
      await supabase.from("notification_log").insert({
        user_id: user.id,
        quote_id: quote.id,
        notification_type: "follow_up",
        channel: "email",
        recipient: quote.customer_email,
        subject: subjectLine,
        status: "failed",
        error_message: emailError instanceof Error ? emailError.message : "Unknown error",
      });

      return NextResponse.json({ error: "Failed to send follow-up email" }, { status: 500 });
    }
  } else {
    console.log("Resend not configured - follow-up email would be sent to:", quote.customer_email);
    console.log("Quote URL:", quoteUrl);
    emailSent = true;
  }

  if (emailSent) {
    await supabase
      .from("quotes")
      .update({
        follow_up_count: followUpNumber,
        follow_up_sent: true,
        last_follow_up_at: new Date().toISOString(),
      })
      .eq("id", quote.id);

    // Log the notification
    await supabase.from("notification_log").insert({
      user_id: user.id,
      quote_id: quote.id,
      notification_type: "follow_up",
      channel: "email",
      recipient: quote.customer_email,
      subject: subjectLine,
      status: "sent",
    });
  }

  revalidateTag(getQuotesListCacheTag(user.id));
  revalidateTag(getQuotesStatsCacheTag(user.id));

  return NextResponse.json({
    success: true,
    message: resend ? "Follow-up sent successfully" : "Follow-up marked as sent (email not configured)",
    followUpNumber,
  });
}
