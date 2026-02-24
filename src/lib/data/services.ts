import { unstable_cache } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/server-service";
import type { ServiceItem } from "@/types";

const SERVICE_LIBRARY_REVALIDATE = 60;

export function getServiceLibraryCacheTag(userId: string) {
  return `service-library-${userId}`;
}

export async function getCachedServiceLibrary(userId: string): Promise<ServiceItem[]> {
  return unstable_cache(
    async () => {
      const supabase = createServiceRoleClient();
      const { data } = await supabase
        .from("service_library")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("service_name", { ascending: true });
      return (data ?? []) as ServiceItem[];
    },
    ["service-library", userId],
    { revalidate: SERVICE_LIBRARY_REVALIDATE, tags: [getServiceLibraryCacheTag(userId)] }
  )();
}
