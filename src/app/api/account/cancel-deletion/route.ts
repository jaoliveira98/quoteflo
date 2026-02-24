import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Invalid password. Please try again." },
      { status: 401 }
    );
  }

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ deletion_scheduled_at: null })
    .eq("id", user.id);

  if (updateError) {
    console.error("Cancel deletion error:", updateError);
    return NextResponse.json(
      { error: "Failed to cancel deletion" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
