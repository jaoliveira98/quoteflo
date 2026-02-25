import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

const QUOTES_LIST_REVALIDATE = 60;

export type QuoteListItem = {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string | null;
  status: string;
  total: number;
  created_at: string;
};

export function getQuotesListCacheTag(userId: string) {
  return `quotes-${userId}`;
}

export async function getCachedQuotesList(
  userId: string,
  status: string | undefined,
  date: string | undefined,
  dateRange: { start: string; end?: string } | null
): Promise<QuoteListItem[]> {
  const cacheKey = ["quotes-list", userId, status ?? "all", date ?? "all"].filter(Boolean);

  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      let query = supabase
        .from("quotes")
        .select("id, quote_number, customer_name, customer_email, status, total, created_at, sent_at, viewed_at, accepted_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }
      if (dateRange) {
        query = query.gte("created_at", dateRange.start);
        if (dateRange.end) {
          query = query.lte("created_at", dateRange.end);
        }
      }

      const { data } = await query;
      return (data ?? []) as QuoteListItem[];
    },
    cacheKey,
    { revalidate: QUOTES_LIST_REVALIDATE, tags: [getQuotesListCacheTag(userId)] }
  )();
}

export type QuoteForAnalytics = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  customer_name: string;
  customer_id: string | null;
};

export async function getCachedQuotesForAnalytics(userId: string): Promise<QuoteForAnalytics[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("quotes")
        .select("id, status, total, created_at, sent_at, viewed_at, accepted_at, customer_name, customer_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      return (data ?? []) as QuoteForAnalytics[];
    },
    ["quotes-analytics", userId],
    { revalidate: QUOTES_LIST_REVALIDATE, tags: [getQuotesListCacheTag(userId)] }
  )();
}
