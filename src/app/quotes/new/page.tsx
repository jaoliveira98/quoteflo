import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { getCachedCustomers } from "@/lib/data/customers";
import { getCachedServiceLibrary } from "@/lib/data/services";
import { QuoteForm } from "./quote-form";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const profile = await requireAuthWithProfile();
  const { customer: customerId } = await searchParams;

  const [services, customers] = await Promise.all([
    getCachedServiceLibrary(profile.id),
    getCachedCustomers(profile.id),
  ]);

  const selectedCustomer = customerId
    ? customers.find((c) => c.id === customerId) ?? null
    : null;

  return (
    <DashboardShell
      user={{
        email: profile.business_email ?? profile.email,
        company_name: profile.company_name,
        brand_color: profile.brand_color,
      }}
      hasAccess={hasActiveSubscription(profile)}
    >
        <QuoteForm
          profile={profile}
          services={services}
          customers={customers}
          preselectedCustomer={selectedCustomer}
          hasAccess={hasActiveSubscription(profile)}
        />
    </DashboardShell>
  );
}
