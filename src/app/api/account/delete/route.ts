import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";

const GRACE_DAYS = 30;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Invalid password. Please try again." },
      { status: 401 }
    );
  }

  const deletionScheduledAt = new Date();
  deletionScheduledAt.setDate(deletionScheduledAt.getDate() + GRACE_DAYS);
  const deletionDateFormatted = deletionScheduledAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ deletion_scheduled_at: deletionScheduledAt.toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error("Schedule deletion error:", updateError);
    return NextResponse.json(
      { error: "Failed to schedule account deletion" },
      { status: 500 }
    );
  }

  const fromDomain = process.env.RESEND_DOMAIN || "resend.dev";
  if (resend) {
    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="padding: 20px 0;">
    <h1 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">Account deletion scheduled</h1>
    <p style="margin: 0; color: #64748b;">
      The account associated with ${escapeHtml(user.email)} is scheduled to be permanently deleted on <strong>${escapeHtml(deletionDateFormatted)}</strong> (30 days from now).
    </p>
    <p style="margin: 16px 0 0; color: #64748b;">
      You have 30 days to change your mind. Until then, you can log in and go to Settings to cancel the deletion and keep your account and data. If you did not request this, we recommend logging in now and cancelling the deletion.
    </p>
  </div>
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 14px; color: #94a3b8;">
    <p style="margin: 0;">QuoteFlo</p>
  </div>
</body>
</html>
      `;
      await resend.emails.send({
        from: `QuoteFlo <noreply@${fromDomain}>`,
        to: user.email,
        subject: "Your QuoteFlo account is scheduled for deletion",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Account deletion scheduled email error:", emailError);
    }
  }

  return NextResponse.json({
    success: true,
    deletion_scheduled_at: deletionScheduledAt.toISOString(),
  });
}
