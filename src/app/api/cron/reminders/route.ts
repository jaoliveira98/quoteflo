import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatCurrency, escapeHtml } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

async function sendFollowUpEmail(quote: {
  quote_id: string;
  user_id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  follow_up_count: number;
  company_name: string;
  phone: string | null;
  brand_color: string;
  access_token: string;
  job_description?: string;
  valid_until?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const quoteUrl = `${baseUrl}/q/${quote.access_token}`;
  
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

  const brandColor = escapeHtml(quote.brand_color || "#22c55e");
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${brandColor};">
    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${escapeHtml(quote.company_name)}</h1>
  </div>
  
  <div style="padding: 30px 0;">
    <p style="margin: 0 0 20px;">Hi ${escapeHtml(quote.customer_name.split(" ")[0])},</p>
    
    ${followUpMessage}
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Quote Number:</strong> ${escapeHtml(quote.quote_number)}</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandColor};">Total: ${formatCurrency(Number(quote.total))}</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">(inc. VAT)</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${quoteUrl}" style="display: inline-block; background: ${brandColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Quote</a>
    </div>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #64748b;">
    <p style="margin: 0;">Best regards,</p>
    <p style="margin: 5px 0 0; font-weight: 600; color: #1e293b;">${escapeHtml(quote.company_name)}</p>
    ${quote.phone ? `<p style="margin: 5px 0 0;">${escapeHtml(quote.phone)}</p>` : ""}
  </div>
</body>
</html>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: `${quote.company_name} <quotes@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
        to: quote.customer_email,
        subject: subjectLine,
        html: emailHtml,
      });
      return { success: true, followUpNumber };
    } catch (error) {
      console.error("Follow-up email error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  
  console.log("Resend not configured - would send follow-up to:", quote.customer_email);
  return { success: true, followUpNumber, simulated: true };
}

async function sendExpiryReminderEmail(quote: {
  quote_id: string;
  user_id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  valid_until: string;
  company_name: string;
  phone: string | null;
  brand_color: string;
  access_token: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const quoteUrl = `${baseUrl}/q/${quote.access_token}`;
  
  const expiryDate = new Date(quote.valid_until);
  const formattedExpiry = expiryDate.toLocaleDateString("en-GB", { 
    weekday: "long",
    day: "numeric", 
    month: "long" 
  });

  const brandColor = escapeHtml(quote.brand_color || "#22c55e");
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid ${brandColor};">
    <h1 style="margin: 0; font-size: 24px; color: #0f172a;">${escapeHtml(quote.company_name)}</h1>
  </div>
  
  <div style="padding: 30px 0;">
    <p style="margin: 0 0 20px;">Hi ${escapeHtml(quote.customer_name.split(" ")[0])},</p>
    
    <p style="margin: 0 0 20px;">Just a quick heads up – the quote I sent you is expiring soon.</p>
    
    <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">⏰ Quote expires on</p>
      <p style="margin: 5px 0 0; font-size: 20px; font-weight: 700; color: #92400e;">${escapeHtml(formattedExpiry)}</p>
    </div>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px;"><strong>Quote Number:</strong> ${escapeHtml(quote.quote_number)}</p>
      <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${brandColor};">Total: ${formatCurrency(Number(quote.total))}</p>
      <p style="margin: 5px 0 0; font-size: 14px; color: #64748b;">(inc. VAT)</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${quoteUrl}" style="display: inline-block; background: ${brandColor}; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View & Accept Quote</a>
    </div>
    
    <p style="margin: 0 0 20px;">If you'd like to proceed after this date, just get in touch and I'll be happy to send an updated quote.</p>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #64748b;">
    <p style="margin: 0;">Best regards,</p>
    <p style="margin: 5px 0 0; font-weight: 600; color: #1e293b;">${escapeHtml(quote.company_name)}</p>
    ${quote.phone ? `<p style="margin: 5px 0 0;">${escapeHtml(quote.phone)}</p>` : ""}
  </div>
</body>
</html>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: `${quote.company_name} <quotes@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
        to: quote.customer_email,
        subject: `Your quote expires soon: ${quote.quote_number}`,
        html: emailHtml,
      });
      return { success: true };
    } catch (error) {
      console.error("Expiry reminder email error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
  
  console.log("Resend not configured - would send expiry reminder to:", quote.customer_email);
  return { success: true, simulated: true };
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    followUps: { processed: 0, sent: 0, failed: 0 },
    expiryReminders: { processed: 0, sent: 0, failed: 0 },
  };

  const { data: followUpQuotes, error: followUpError } = await supabase
    .rpc("get_quotes_needing_followup");

  if (followUpError) {
    console.error("Error fetching follow-up quotes:", followUpError);
  } else if (followUpQuotes && followUpQuotes.length > 0) {
    for (const quote of followUpQuotes) {
      results.followUps.processed++;
      
      const result = await sendFollowUpEmail(quote);
      
      if (result.success) {
        results.followUps.sent++;
        
        await supabase
          .from("quotes")
          .update({
            follow_up_count: result.followUpNumber,
            follow_up_sent: true,
            last_follow_up_at: new Date().toISOString(),
          })
          .eq("id", quote.quote_id);

        await supabase.from("notification_log").insert({
          user_id: quote.user_id,
          quote_id: quote.quote_id,
          notification_type: "follow_up",
          channel: "email",
          recipient: quote.customer_email,
          subject: `Follow-up #${result.followUpNumber}: Quote ${quote.quote_number}`,
          status: "sent",
        });
      } else {
        results.followUps.failed++;
        
        await supabase.from("notification_log").insert({
          user_id: quote.user_id,
          quote_id: quote.quote_id,
          notification_type: "follow_up",
          channel: "email",
          recipient: quote.customer_email,
          status: "failed",
          error_message: result.error,
        });
      }
    }
  }

  const { data: expiryQuotes, error: expiryError } = await supabase
    .rpc("get_quotes_expiring_soon");

  if (expiryError) {
    console.error("Error fetching expiry quotes:", expiryError);
  } else if (expiryQuotes && expiryQuotes.length > 0) {
    for (const quote of expiryQuotes) {
      results.expiryReminders.processed++;
      
      const result = await sendExpiryReminderEmail(quote);
      
      if (result.success) {
        results.expiryReminders.sent++;
        
        await supabase
          .from("quotes")
          .update({
            expiry_reminder_sent: true,
            expiry_reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", quote.quote_id);

        await supabase.from("notification_log").insert({
          user_id: quote.user_id,
          quote_id: quote.quote_id,
          notification_type: "expiry_reminder",
          channel: "email",
          recipient: quote.customer_email,
          subject: `Quote expiring soon: ${quote.quote_number}`,
          status: "sent",
        });
      } else {
        results.expiryReminders.failed++;
        
        await supabase.from("notification_log").insert({
          user_id: quote.user_id,
          quote_id: quote.quote_id,
          notification_type: "expiry_reminder",
          channel: "email",
          recipient: quote.customer_email,
          status: "failed",
          error_message: result.error,
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
