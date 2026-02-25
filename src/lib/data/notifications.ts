import { createServiceRoleClient } from "@/lib/supabase/server-service";

export type NotificationEventType = "sent" | "viewed" | "accepted" | "declined";

export type NotificationEvent = {
  id: string;
  quoteId: string;
  customerName: string;
  quoteNumber: string;
  type: NotificationEventType;
  at: string;
};

export async function getRecentNotifications(
  userId: string,
  eventLimit = 50
): Promise<NotificationEvent[]> {
  const supabase = createServiceRoleClient();

  const { data: quotes } = await supabase
    .from("quotes")
    .select(
      "id, quote_number, customer_name, status, created_at, sent_at, viewed_at, accepted_at, declined_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!quotes) return [];

  const events: NotificationEvent[] = (quotes as any[])
    .flatMap((quote) => {
      const quoteEvents: NotificationEvent[] = [];

      if (quote.sent_at) {
        quoteEvents.push({
          id: `${quote.id}-sent-${quote.sent_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "sent",
          at: quote.sent_at,
        });
      }

      if (quote.viewed_at) {
        quoteEvents.push({
          id: `${quote.id}-viewed-${quote.viewed_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "viewed",
          at: quote.viewed_at,
        });
      }

      if (quote.accepted_at) {
        quoteEvents.push({
          id: `${quote.id}-accepted-${quote.accepted_at}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "accepted",
          at: quote.accepted_at,
        });
      }

      if (quote.status === "declined") {
        const declinedAt =
          quote.declined_at || quote.viewed_at || quote.sent_at || quote.created_at;
        quoteEvents.push({
          id: `${quote.id}-declined-${declinedAt}`,
          quoteId: quote.id,
          customerName: quote.customer_name,
          quoteNumber: quote.quote_number,
          type: "declined",
          at: declinedAt,
        });
      }

      return quoteEvents;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, eventLimit);

  return events;
}

