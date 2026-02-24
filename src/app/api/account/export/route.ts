import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: profile }, { data: customers }, { data: quotes }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("customers").select("*").eq("user_id", user.id).order("name"),
    supabase.from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const quotesWithItems = await Promise.all(
    (quotes ?? []).map(async (quote) => {
      const { data: lineItems } = await supabase
        .from("quote_line_items")
        .select("*")
        .eq("quote_id", quote.id)
        .order("item_order");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- exclude access_token from export
      const { access_token, ...quoteWithoutToken } = quote;
      return { ...quoteWithoutToken, line_items: lineItems ?? [] };
    })
  );

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile ?? null,
    customers: customers ?? [],
    quotes: quotesWithItems,
  };

  const filename = `quoteflo-data-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
