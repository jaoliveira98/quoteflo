import { DashboardShell } from "@/components/dashboard-shell";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Search */}
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
