import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/types";

async function getUserUncached() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export const getUser = cache(getUserUncached);

async function getUserProfileUncached(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) return null;
  return profile as UserProfile;
}

export const getUserProfile = cache(getUserProfileUncached);

export async function requireAuth() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}

export async function requireAuthWithProfile() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

export function hasActiveSubscription(profile: UserProfile): boolean {
  if (profile.subscription_status === "active") return true;
  if (
    profile.subscription_status === "trialing" &&
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) > new Date()
  ) {
    return true;
  }
  return false;
}
