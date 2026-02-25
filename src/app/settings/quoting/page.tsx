import { PageHeader } from "@/components/page-header";
import { SettingsShellWithPreview } from "@/components/settings-shell-with-preview";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { QuotingSettingsSection } from "../settings-form";

export default async function SettingsQuotingPage() {
  const profile = await requireAuthWithProfile();

  return (
    <SettingsShellWithPreview profile={profile} hasAccess={hasActiveSubscription(profile)}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <PageHeader title="Quoting" subtitle="Default values and automation for your quotes" />
        <QuotingSettingsSection profile={profile} />
      </div>
    </SettingsShellWithPreview>
  );
}
