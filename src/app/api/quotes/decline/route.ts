import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getQuotesListCacheTag } from "@/lib/data/quotes";
import { getQuotesStatsCacheTag } from "@/lib/data/customers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token, quote_id } = await request.json();

    if (!token || !quote_id) {
      return NextResponse.json(
        { error: "Token and quote_id are required" },
        { status: 400 }
      );
    }

    const { data: success, error } = await supabase.rpc(
      "update_quote_status_by_token",
      {
        p_token: token,
        p_quote_id: quote_id,
        p_status: "declined",
        p_accepted_at: null,
      }
    );

    if (error || !success) {
      return NextResponse.json({ error: "Quote not found or invalid token" }, { status: 404 });
    }

    const { data: quote } = await supabase
      .from("quotes")
      .select("user_id")
      .eq("id", quote_id)
      .single();
    if (quote?.user_id) {
      revalidateTag(getQuotesListCacheTag(quote.user_id));
      revalidateTag(getQuotesStatsCacheTag(quote.user_id));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
