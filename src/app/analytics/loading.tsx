import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonAnalytics } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonAnalytics />
      </div>
    </DashboardShell>
  );
}
