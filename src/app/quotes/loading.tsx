import { DashboardShell } from "@/components/dashboard-shell";
import { Skeleton, SkeletonQuoteRow } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Quote Rows */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonQuoteRow key={i} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
