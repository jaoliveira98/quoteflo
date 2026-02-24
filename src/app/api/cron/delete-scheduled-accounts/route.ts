import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dryRun = url.searchParams.get("dry_run") === "1" || url.searchParams.get("dry_run") === "true";

  const now = new Date().toISOString();
  const { data: profiles, error: selectError } = await supabase
    .from("user_profiles")
    .select("id, email, deletion_scheduled_at")
    .not("deletion_scheduled_at", "is", null)
    .lte("deletion_scheduled_at", now);

  if (selectError) {
    console.error("Error fetching scheduled deletions:", selectError);
    return NextResponse.json(
      { error: "Failed to fetch scheduled deletions" },
      { status: 500 }
    );
  }

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dry_run: true,
      timestamp: new Date().toISOString(),
      would_process: profiles?.length ?? 0,
      accounts: (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        deletion_scheduled_at: p.deletion_scheduled_at,
      })),
    });
  }

  const results = { processed: 0, deleted: 0, failed: 0 };
  const fromDomain = process.env.RESEND_DOMAIN || "resend.dev";

  for (const profile of profiles ?? []) {
    results.processed++;
    const userEmail = profile.email;

    if (resend && userEmail) {
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
    <h1 style="margin: 0 0 16px; font-size: 20px; color: #1e293b;">Your QuoteFlo account has been deleted</h1>
    <p style="margin: 0; color: #64748b;">
      This email confirms that the account associated with ${escapeHtml(userEmail)} has been permanently deleted.
    </p>
    <p style="margin: 16px 0 0; color: #64748b;">
      All your data has been removed from our systems.
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
          to: userEmail,
          subject: "Your QuoteFlo account has been deleted",
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Account deleted email error for", userEmail, emailError);
      }
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(profile.id);
    if (deleteError) {
      console.error("Account delete error for", profile.id, deleteError);
      results.failed++;
    } else {
      results.deleted++;
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
