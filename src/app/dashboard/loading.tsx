import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonDashboard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonDashboard />
      </div>
    </DashboardShell>
  );
}
