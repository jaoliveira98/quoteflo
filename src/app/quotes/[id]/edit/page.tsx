import { DashboardShell } from "@/components/dashboard-shell";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCachedServiceLibrary } from "@/lib/data/services";
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

  const [lineItemsResult, services] = await Promise.all([
    supabase
      .from("quote_line_items")
      .select("*")
      .eq("quote_id", quote.id)
      .order("item_order", { ascending: true }),
    getCachedServiceLibrary(profile.id),
  ]);

  const lineItems = lineItemsResult.data ?? [];

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <EditQuoteForm
        profile={profile}
        quote={quote}
        existingLineItems={lineItems}
        services={services}
        hasAccess={hasActiveSubscription(profile)}
      />
    </DashboardShell>
  );
}
