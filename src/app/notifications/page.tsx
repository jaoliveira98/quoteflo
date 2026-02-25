import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Send, XCircle } from "lucide-react";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import {
  getRecentNotifications,
  NotificationEvent,
} from "@/lib/data/notifications";

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} • ${timePart}`;
}

function getLabelAndVariant(event: NotificationEvent) {
  switch (event.type) {
    case "accepted":
      return { label: "Quote accepted", variant: "success" as const };
    case "declined":
      return { label: "Quote declined", variant: "destructive" as const };
    case "viewed":
      return { label: "Quote opened", variant: "outline" as const };
    default:
      return { label: "Quote sent", variant: "secondary" as const };
  }
}

function getIcon(event: NotificationEvent) {
  switch (event.type) {
    case "accepted":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "declined":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "viewed":
      return <Eye className="h-4 w-4 text-amber-600" />;
    default:
      return <Send className="h-4 w-4 text-blue-600" />;
  }
}

export default async function NotificationsPage() {
  const profile = await requireAuthWithProfile();
  const events = await getRecentNotifications(profile.id, 100);

  return (
    <DashboardShell
      user={{
        email: profile.email,
        company_name: profile.company_name,
        brand_color: profile.brand_color,
      }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              Notifications
            </h1>
            <p className="text-surface-600 text-sm">
              See when customers opened, accepted, or declined your quotes.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="py-12 text-center text-sm text-surface-500">
                You don&apos;t have any notifications yet. Once you start
                sending quotes, you&apos;ll see updates here when customers
                open, accept, or decline them.
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {events.map((event) => {
                  const { label, variant } = getLabelAndVariant(event);
                  return (
                    <Link
                      key={event.id}
                      href={`/quotes/${event.quoteId}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 sm:py-3.5 hover:bg-surface-50 px-2 sm:px-3 rounded-lg -mx-2 sm:-mx-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-surface-100 flex items-center justify-center flex-shrink-0">
                          {getIcon(event)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 truncate">
                            {event.customerName}
                          </p>
                          <p className="text-xs text-surface-500 truncate">
                            {event.quoteNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start sm:items-center justify-between sm:justify-end gap-2 flex-1">
                        <Badge variant={variant}>{label}</Badge>
                        <span className="text-xs text-surface-400 whitespace-nowrap">
                          {formatTimestamp(event.at)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

