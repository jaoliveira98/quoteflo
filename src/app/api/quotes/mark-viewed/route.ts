import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("id, status, viewed_at")
      .eq("access_token", access_token)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status === "sent" && !quote.viewed_at) {
      const { data: success, error: updateError } = await supabase.rpc(
        "update_quote_status_by_token",
        {
          p_token: access_token,
          p_quote_id: quote.id,
          p_status: "viewed",
          p_accepted_at: new Date().toISOString(),
        }
      );

      if (updateError || !success) {
        console.error("Update error:", updateError);
        return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
      }

      return NextResponse.json({ success: true, viewed_at: new Date().toISOString() });
    }

    return NextResponse.json({ success: true, already_viewed: true });
  } catch (error) {
    console.error("Mark viewed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
