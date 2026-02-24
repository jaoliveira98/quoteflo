import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

const CUSTOMERS_REVALIDATE = 60;

export function getCustomersCacheTag(userId: string) {
  return `customers-${userId}`;
}

export function getQuotesStatsCacheTag(userId: string) {
  return `quotes-stats-${userId}`;
}

export async function getCachedCustomers(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });
      return data ?? [];
    },
    ["customers", userId],
    { revalidate: CUSTOMERS_REVALIDATE, tags: [getCustomersCacheTag(userId)] }
  )();
}

export async function getCachedQuotesForStats(userId: string) {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("quotes")
        .select("customer_id, customer_name, customer_email, total, status")
        .eq("user_id", userId);
      return data ?? [];
    },
    ["quotes-stats", userId],
    { revalidate: CUSTOMERS_REVALIDATE, tags: [getQuotesStatsCacheTag(userId)] }
  )();
}
