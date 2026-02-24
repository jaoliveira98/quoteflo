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
