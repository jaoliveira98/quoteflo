import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { getCachedServiceLibrary } from "@/lib/data/services";
import { ServicesManager } from "./services-manager";

export default async function ServicesPage() {
  const profile = await requireAuthWithProfile();
  const services = await getCachedServiceLibrary(profile.id);

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <ServicesManager profile={profile} initialServices={services} hasAccess={hasActiveSubscription(profile)} />
    </DashboardShell>
  );
}
