import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getRecentNotifications,
  NotificationEvent,
} from "@/lib/data/notifications";

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json<ApiResponse<NotificationEvent[]>>(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const events = await getRecentNotifications(user.id, 20);

    return NextResponse.json<ApiResponse<NotificationEvent[]>>(
      { data: events, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json<ApiResponse<NotificationEvent[]>>(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}

