import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditQuoteForm } from "./edit-quote-form";

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (quoteError || !quote) {
    notFound();
  }

  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("item_order", { ascending: true });

  const { data: services } = await supabase
    .from("service_library")
    .select("*")
    .eq("trade", profile.trade)
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("service_name", { ascending: true });

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <EditQuoteForm
        profile={profile}
        quote={quote}
        existingLineItems={lineItems || []}
        services={services || []}
      />
    </DashboardShell>
  );
}
