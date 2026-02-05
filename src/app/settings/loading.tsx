import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonSettings } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonSettings />
      </div>
    </DashboardShell>
  );
}
