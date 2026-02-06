import { DashboardShell } from "@/components/dashboard-shell";

export default function ServicesLoading() {
  return (
    <DashboardShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
            <div className="h-5 w-72 bg-surface-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-surface-200 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
