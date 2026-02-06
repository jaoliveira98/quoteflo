import type { SupabaseClient } from "@supabase/supabase-js";

interface CustomerFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
}

/**
 * Finds an existing customer by email or name, or creates a new one.
 * When matched by name, updates any missing contact fields.
 */
export async function findOrCreateCustomer(
  supabase: SupabaseClient,
  userId: string,
  fields: CustomerFields,
  selectedCustomerId: string | null
): Promise<string> {
  if (selectedCustomerId) {
    return selectedCustomerId;
  }

  const trimmedName = fields.name.trim();
  const trimmedEmail = fields.email.trim() || null;
  const trimmedPhone = fields.phone.trim() || null;
  const trimmedAddress = fields.address.trim() || null;
  const trimmedPostcode = fields.postcode.trim() || null;

  if (trimmedEmail) {
    const { data: byEmail } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", userId)
      .eq("email", trimmedEmail)
      .limit(1)
      .maybeSingle();

    if (byEmail) return byEmail.id;
  }

  const { data: byName } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", trimmedName)
    .limit(1)
    .maybeSingle();

  if (byName) {
    const updates: Record<string, string | null> = {};
    if (trimmedEmail) updates.email = trimmedEmail;
    if (trimmedPhone) updates.phone = trimmedPhone;
    if (trimmedAddress) updates.address = trimmedAddress;
    if (trimmedPostcode) updates.postcode = trimmedPostcode;

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("customers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", byName.id);
    }

    return byName.id;
  }

  const { data: newCustomer, error: customerError } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
      postcode: trimmedPostcode,
      emails: trimmedEmail ? [trimmedEmail] : [],
      phones: trimmedPhone ? [trimmedPhone] : [],
    })
    .select("id")
    .single();

  if (customerError) {
    console.error("Customer creation error:", customerError);
    throw new Error("Failed to create customer");
  }

  return newCustomer.id;
}
