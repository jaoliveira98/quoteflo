import { PageHeader } from "@/components/page-header";
import { SettingsShellWithPreview } from "@/components/settings-shell-with-preview";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { AccountSettingsSection } from "../settings-form";

export default async function SettingsAccountPage() {
  const profile = await requireAuthWithProfile();

  return (
    <SettingsShellWithPreview profile={profile} hasAccess={hasActiveSubscription(profile)}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <PageHeader title="Account" subtitle="Security and billing" />
        <AccountSettingsSection profile={profile} />
      </div>
    </SettingsShellWithPreview>
  );
}
