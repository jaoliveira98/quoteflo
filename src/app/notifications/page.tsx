import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { STATUS_ICONS, STATUS_ICON_STYLES } from "@/lib/constants";
import {
  getRecentNotifications,
  NotificationEvent,
} from "@/lib/data/notifications";
import type { QuoteStatus } from "@/types";

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
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Notifications"
          subtitle="See when customers opened, accepted, or declined your quotes."
        />

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
                  const eventStatus = event.type as QuoteStatus;
                  const StatusIcon = STATUS_ICONS[eventStatus];
                  const style = STATUS_ICON_STYLES[eventStatus];
                  return (
                    <Link
                      key={event.id}
                      href={`/quotes/${event.quoteId}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                          <StatusIcon className={`h-4 w-4 ${style.color}`} />
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
                      <div className="flex items-center gap-3 flex-shrink-0">
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

