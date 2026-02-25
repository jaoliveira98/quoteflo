import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-pulse">
      <div className="h-7 w-40 rounded-md bg-surface-100" />
      <Card>
        <CardHeader>
          <CardTitle className="h-5 w-32 rounded-md bg-surface-100" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 py-2 border-b border-surface-100 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-surface-100" />
                  <div className="space-y-1 min-w-0">
                    <div className="h-3 w-32 rounded bg-surface-100" />
                    <div className="h-3 w-24 rounded bg-surface-100" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="h-5 w-20 rounded-full bg-surface-100" />
                  <div className="h-3 w-24 rounded bg-surface-100" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

