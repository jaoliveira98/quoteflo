import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-200",
        className
      )}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-surface-200 bg-white p-5", className)}>
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-5 w-5" />
      </div>
      <Skeleton className="h-5 w-32 mb-2" />
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export function SkeletonQuoteRow() {
  return (
    <div className="rounded-xl border border-surface-200 bg-white shadow-soft p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="hidden sm:block h-3 w-1" />
              <Skeleton className="hidden sm:block h-3 w-24" />
            </div>
          </div>
        </div>
        <Skeleton className="h-4 w-16 sm:h-5 sm:w-20 flex-shrink-0" />
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatsWithChange() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16 mt-1" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonQuoteDetail() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Customer Card */}
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-44" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      </div>

      {/* Quote Items Card */}
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <Skeleton className="h-5 w-24 mb-4" />
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 pb-2 mb-3 border-b border-surface-200">
          <Skeleton className="col-span-6 h-4 w-20" />
          <Skeleton className="col-span-2 h-4 w-8 ml-auto" />
          <Skeleton className="col-span-2 h-4 w-16 ml-auto" />
          <Skeleton className="col-span-2 h-4 w-10 ml-auto" />
        </div>
        {/* Items */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 p-4 rounded-lg bg-surface-50 items-center">
              <div className="col-span-12 sm:col-span-6">
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Skeleton className="h-4 w-6 sm:ml-auto" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Skeleton className="h-4 w-14 sm:ml-auto" />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
        {/* Totals */}
        <div className="mt-6 pt-4 border-t border-surface-200">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-8">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-8">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-8 pt-2 border-t border-surface-200">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Card */}
      <div className="rounded-xl border border-surface-200 bg-white p-6">
        <Skeleton className="h-5 w-16 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonCustomerDetail() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4 rounded mt-0.5" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Quote History */}
        <div className="lg:col-span-2 rounded-xl border border-surface-200 bg-white p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border border-surface-200"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1.5" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-3.5 rounded" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-surface-200">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <Skeleton className="h-5 w-28 mb-6" />
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="pt-4 border-t border-surface-200">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="pt-4 border-t border-surface-200 space-y-2">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonAnalytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* KPI Cards with change indicators */}
      <SkeletonStatsWithChange />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col rounded-xl border border-surface-200 bg-white">
          <div className="p-6 pb-0 flex flex-row items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="p-6 flex-1">
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col rounded-xl border border-surface-200 bg-white">
          <div className="p-6 pb-0">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="p-6 flex-1">
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Funnel + Performance Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quote Funnel */}
        <div className="flex flex-col rounded-xl border border-surface-200 bg-white">
          <div className="p-6 pb-0">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex flex-col rounded-xl border border-surface-200 bg-white">
          <div className="p-6 pb-0">
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="p-6 flex-1 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
                {i < 3 && <div className="border-t border-surface-200 mt-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="flex flex-col rounded-xl border border-surface-200 bg-white">
        <div className="p-6 pb-0">
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="p-6 flex-1">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border border-surface-200"
              >
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-1.5 flex-1 mr-4 rounded-full" />
                    <Skeleton className="h-3 w-24 flex-shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Business section */}
      <div className="space-y-4">
        <div className="pb-1 space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Company Details Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-56 mb-4" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Branding Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-64 mb-4" />
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* Quoting section */}
      <div className="space-y-4">
        <div className="pb-1 space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Quote Defaults Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-4 w-72 mb-4" />
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <div className="border-t border-surface-100" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-4 w-80 mb-4" />
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
            <div className="border-t border-surface-100" />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Account section */}
      <div className="space-y-4">
        <div className="pb-1 space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Password Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-44 mb-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Billing Card */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-20 w-full rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonServices() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Category Groups */}
      {Array.from({ length: 2 }).map((_, catIndex) => (
        <div key={catIndex} className="rounded-xl border border-surface-200 bg-white">
          <div className="p-6 pb-3">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="px-6 pb-6 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border border-surface-200"
              >
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
