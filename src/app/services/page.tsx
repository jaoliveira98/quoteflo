import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "./services-manager";

export default async function ServicesPage() {
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("service_library")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("service_name", { ascending: true });

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <ServicesManager profile={profile} initialServices={services || []} />
    </DashboardShell>
  );
}
