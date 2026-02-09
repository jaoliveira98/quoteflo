import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // First, verify the quote exists and get its current status
    const { data: quote, error: fetchError } = await supabase
      .from("quotes")
      .select("id, status, viewed_at")
      .eq("access_token", access_token)
      .single();

    if (fetchError || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Only update if status is "sent" and not already viewed
    if (quote.status === "sent" && !quote.viewed_at) {
      const { error: updateError } = await supabase
        .from("quotes")
        .update({
          status: "viewed",
          viewed_at: new Date().toISOString(),
        })
        .eq("id", quote.id)
        .eq("access_token", access_token);

      if (updateError) {
        console.error("Update error:", updateError);
        return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
      }

      return NextResponse.json({ success: true, viewed_at: new Date().toISOString() });
    }

    // Already viewed or not in sent status
    return NextResponse.json({ success: true, already_viewed: true });
  } catch (error) {
    console.error("Mark viewed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
