import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonCustomerDetail } from "@/components/ui/skeleton";

export default function CustomerDetailLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonCustomerDetail />
      </div>
    </DashboardShell>
  );
}
