import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const profile = await requireAuthWithProfile();

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
          <p className="text-surface-600">Manage your company profile and preferences</p>
        </div>

        <SettingsForm profile={profile} />
      </div>
    </DashboardShell>
  );
}
