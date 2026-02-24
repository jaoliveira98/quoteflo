import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/auth";
import type { UserProfile } from "@/types";
import { getQuotesListCacheTag } from "@/lib/data/quotes";
import { getQuotesStatsCacheTag } from "@/lib/data/customers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { data: deleted, error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete quote" }, { status: 500 });
  }

  if (!deleted?.length) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  revalidateTag(getQuotesListCacheTag(user.id));
  revalidateTag(getQuotesStatsCacheTag(user.id));

  return NextResponse.json({ success: true });
}
