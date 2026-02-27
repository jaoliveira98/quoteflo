import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getRecentNotifications,
  NotificationEvent,
} from "@/lib/data/notifications";

type NotificationsResponse = {
  events: NotificationEvent[];
  lastSeenAt: number;
};

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<ApiResponse<NotificationsResponse>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [events, { data: profile }] = await Promise.all([
      getRecentNotifications(user.id, 20),
      supabase
        .from("user_profiles")
        .select("notifications_last_seen_at")
        .eq("id", user.id)
        .single(),
    ]);

    const lastSeenAt = profile?.notifications_last_seen_at
      ? new Date(profile.notifications_last_seen_at).getTime()
      : 0;

    return NextResponse.json<ApiResponse<NotificationsResponse>>(
      { data: { events, lastSeenAt }, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json<ApiResponse<NotificationsResponse>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const lastSeenAt = body.lastSeenAt;

    if (typeof lastSeenAt !== "number" || lastSeenAt <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid lastSeenAt" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        notifications_last_seen_at: new Date(lastSeenAt).toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Notifications seen update error:", error);
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Failed to update" },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notifications seen API error:", error);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

