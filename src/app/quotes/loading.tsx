import { DashboardShell } from "@/components/dashboard-shell";
import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function QuotesLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg flex-shrink-0" />
          ))}
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />

        {/* Table */}
        <SkeletonTable rows={6} />
      </div>
    </DashboardShell>
  );
}
