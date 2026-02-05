import { DashboardShell } from "@/components/dashboard-shell";
import { SkeletonQuoteDetail } from "@/components/ui/skeleton";

export default function QuoteDetailLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8">
        <SkeletonQuoteDetail />
      </div>
    </DashboardShell>
  );
}
