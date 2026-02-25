import { PageHeader } from "@/components/page-header";
import { SettingsShellWithPreview } from "@/components/settings-shell-with-preview";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { BusinessSettingsSection } from "../settings-form";

export default async function SettingsBusinessPage() {
  const profile = await requireAuthWithProfile();

  return (
    <SettingsShellWithPreview profile={profile} hasAccess={hasActiveSubscription(profile)}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <PageHeader title="Business" subtitle="Your company info, branding, and trade" />
        <BusinessSettingsSection profile={profile} />
      </div>
    </SettingsShellWithPreview>
  );
}
