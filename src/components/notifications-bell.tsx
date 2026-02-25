"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { STATUS_ICONS, STATUS_ICON_STYLES } from "@/lib/constants";
import type { QuoteStatus } from "@/types";

type NotificationEventType = "sent" | "viewed" | "accepted" | "declined";

type NotificationEvent = {
  id: string;
  quoteId: string;
  customerName: string;
  quoteNumber: string;
  type: NotificationEventType;
  at: string;
};

const NOTIFICATIONS_LAST_SEEN_KEY = "quoteflo-notifications-last-seen";

function getStoredLastSeen(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_LAST_SEEN_KEY);
    return stored ? Math.max(0, parseInt(stored, 10)) : 0;
  } catch {
    return 0;
  }
}

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export function NotificationsBell() {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);

  useEffect(() => {
    setLastSeenAt(getStoredLastSeen());
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/dashboard/notifications");
        if (!res.ok) {
          return;
        }
        const json = (await res.json()) as ApiResponse<NotificationEvent[]>;
        if (isMounted && json.data) {
          setEvents(json.data);
        }
      } catch {
        // Ignore errors – notifications are a secondary enhancement
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = events.filter(
    (e) => new Date(e.at).getTime() > lastSeenAt
  ).length;
  const showBadge = unreadCount > 0;


  const renderLabel = (type: NotificationEventType) => {
    if (type === "accepted") return "Quote accepted";
    if (type === "declined") return "Quote declined";
    if (type === "viewed") return "Quote opened";
    return "Quote sent";
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const datePart = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const timePart = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  };

  const handleOpenChange = (open: boolean) => {
    if (open && events.length > 0) {
      const latest = Math.max(
        ...events.map((e) => new Date(e.at).getTime()),
        Date.now()
      );
      setLastSeenAt(latest);
      try {
        localStorage.setItem(NOTIFICATIONS_LAST_SEEN_KEY, String(latest));
      } catch {
        // ignore
      }
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-surface-500 hover:text-surface-900"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-surface-500">
              {unreadCount} recent update{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && events.length === 0 && (
          <div className="px-2 py-4 text-xs text-surface-500 text-center">
            Loading notifications…
          </div>
        )}
        {!isLoading && events.length === 0 && (
          <div className="px-2 py-4 text-xs text-surface-500 text-center">
            You&apos;ll see updates here when customers open, accept, or decline your quotes.
          </div>
        )}
        {events.length > 0 && (
          <>
            <div className="max-h-96 overflow-y-auto">
              {events.map((event) => {
                const eventStatus = event.type as QuoteStatus;
                const StatusIcon = STATUS_ICONS[eventStatus];
                const style = STATUS_ICON_STYLES[eventStatus];
                return (
                <DropdownMenuItem
                  key={event.id}
                  asChild
                  className="px-0 py-0 focus:bg-transparent"
                >
                  <Link
                    href={`/quotes/${event.quoteId}`}
                    className="flex items-start gap-3 px-2 py-2.5 hover:bg-surface-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-md"
                  >
                    <div
                      className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${style.bg}`}
                      aria-hidden="true"
                    >
                      <StatusIcon className={`h-3.5 w-3.5 ${style.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-surface-900 truncate">
                        {renderLabel(event.type)} – {event.customerName}
                      </p>
                      <p className="text-[11px] text-surface-500 truncate">
                        {event.quoteNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-surface-400">
                        {formatTimestamp(event.at)}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center text-xs font-medium text-brand-600">
              <Link href="/notifications">View all notifications</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

