import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getQuotesListCacheTag } from "@/lib/data/quotes";
import {
  getCustomersCacheTag,
  getQuotesStatsCacheTag,
} from "@/lib/data/customers";
import { getServiceLibraryCacheTag } from "@/lib/data/services";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag(getQuotesListCacheTag(user.id));
  revalidateTag(getCustomersCacheTag(user.id));
  revalidateTag(getQuotesStatsCacheTag(user.id));
  revalidateTag(getServiceLibraryCacheTag(user.id));

  return NextResponse.json({ revalidated: true });
}
