import { DashboardShell } from "@/components/dashboard-shell";
import { Skeleton, SkeletonQuoteRow } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search and Date Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <Skeleton className="h-11 w-full sm:w-[180px] rounded-lg" />
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Quotes List with Grouping */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <Skeleton className="h-4 w-32 mb-3" />
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonQuoteRow key={i} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
