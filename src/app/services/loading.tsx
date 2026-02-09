import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonServices } from "@/components/ui/skeleton";

export default function ServicesLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonServices />
      </div>
    </DashboardShell>
  );
}
