import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "./quote-form";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  const { customer: customerId } = await searchParams;
  
  const { data: services } = await supabase
    .from("service_library")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("service_name", { ascending: true });
  
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", profile.id)
    .order("name", { ascending: true });

  const selectedCustomer = customerId 
    ? customers?.find(c => c.id === customerId) || null
    : null;

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <QuoteForm 
        profile={profile}
        services={services || []}
        customers={customers || []}
        preselectedCustomer={selectedCustomer}
      />
    </DashboardShell>
  );
}
