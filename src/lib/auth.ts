import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/types";

export async function getUser() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (profileError || !profile) {
    return null;
  }
  
  return profile as UserProfile;
}

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
