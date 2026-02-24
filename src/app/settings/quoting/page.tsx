import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { QuotingSettingsSection } from "../settings-form";

export default async function SettingsQuotingPage() {
  const profile = await requireAuthWithProfile();

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quoting</h1>
          <p className="text-surface-500 mt-1">Default values and automation for your quotes</p>
        </div>
        <QuotingSettingsSection profile={profile} />
      </div>
    </DashboardShell>
  );
}
