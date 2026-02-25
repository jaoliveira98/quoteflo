import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardNavLink } from "@/components/dashboard-nav-link";
import { NewQuoteButton } from "@/components/new-quote-button";
import { PageHeader } from "@/components/page-header";
import { ContactInfoRow } from "@/components/contact-info-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { requireAuthWithProfile, hasActiveSubscription } from "@/lib/auth";
import {
  getCachedCustomers,
  getCachedQuotesForStats,
} from "@/lib/data/customers";
import { AddCustomerButton } from "./add-customer-button";
import { CustomersSearch } from "./customers-search";
import { formatCurrency, getInitials } from "@/lib/utils";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const profile = await requireAuthWithProfile();

  const [customers, allQuotes] = await Promise.all([
    getCachedCustomers(profile.id),
    getCachedQuotesForStats(profile.id),
  ]);

  const customerStats: Record<string, { count: number; value: number; accepted: number }> = {};
  
  (allQuotes || []).forEach(quote => {
    if (quote.customer_id) {
      if (!customerStats[quote.customer_id]) {
        customerStats[quote.customer_id] = { count: 0, value: 0, accepted: 0 };
      }
      customerStats[quote.customer_id].count += 1;
      customerStats[quote.customer_id].value += Number(quote.total) || 0;
      if (quote.status === "accepted") {
        customerStats[quote.customer_id].accepted += 1;
      }
    }
  });

  let filteredCustomers = customers || [];
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
      (customer.postcode && customer.postcode.toLowerCase().includes(searchLower)) ||
      (customer.emails && customer.emails.some((e: string) => e.toLowerCase().includes(searchLower))) ||
      (customer.phones && customer.phones.some((p: string) => p.toLowerCase().includes(searchLower)))
    );
  }

  const orphanQuotes = (allQuotes || []).filter(q => !q.customer_id);
  const uniqueOrphanCustomers = new Set(orphanQuotes.map(q => `${q.customer_name}|${q.customer_email || ''}`));

  return (
    <DashboardShell
      user={{ email: profile.email, company_name: profile.company_name, brand_color: profile.brand_color }}
      hasAccess={hasActiveSubscription(profile)}
    >
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Customers"
          subtitle={`${filteredCustomers.length} ${filteredCustomers.length === 1 ? "customer" : "customers"}${search ? " found" : ""}`}
          action={<AddCustomerButton hasAccess={hasActiveSubscription(profile)} />}
        />

        {/* Info banner for orphan quotes */}
        {uniqueOrphanCustomers.size > 0 && !search && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> You have {orphanQuotes.length} quote{orphanQuotes.length !== 1 ? 's' : ''} from {uniqueOrphanCustomers.size} customer{uniqueOrphanCustomers.size !== 1 ? 's' : ''} that aren&apos;t linked yet. 
              Run the database migration to automatically link them.
            </p>
          </div>
        )}

        {/* Search */}
        <CustomersSearch currentSearch={search || ""} />

        {/* Customers List */}
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => {
              const stats = customerStats[customer.id] || { count: 0, value: 0, accepted: 0 };
              const allEmails = [
                ...(customer.email ? [customer.email] : []),
                ...(customer.emails || []),
              ].filter((e: string, i: number, arr: string[]) => e && arr.indexOf(e) === i);
              const allPhones = [
                ...(customer.phone ? [customer.phone] : []),
                ...(customer.phones || []),
              ].filter((p: string, i: number, arr: string[]) => p && arr.indexOf(p) === i);

              return (
                <DashboardNavLink key={customer.id} href={`/customers/${customer.id}`} className="h-full">
                  <Card className="hover:shadow-soft hover:border-surface-300 transition-all cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-brand-700">
                            {getInitials(customer.name)}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-surface-300" />
                      </div>
                      
                      <h3 className="font-semibold text-surface-900 mb-2">{customer.name}</h3>
                      
                      <div className="space-y-1.5">
                        {allEmails.length > 0 && (
                          <div className="flex items-center gap-2 min-w-0">
                            <ContactInfoRow icon={Mail}>{allEmails[0]}</ContactInfoRow>
                            {allEmails.length > 1 && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">+{allEmails.length - 1}</Badge>
                            )}
                          </div>
                        )}
                        {allPhones.length > 0 && (
                          <div className="flex items-center gap-2 min-w-0">
                            <ContactInfoRow icon={Phone}>{allPhones[0]}</ContactInfoRow>
                            {allPhones.length > 1 && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">+{allPhones.length - 1}</Badge>
                            )}
                          </div>
                        )}
                        {customer.postcode && (
                          <ContactInfoRow icon={MapPin}>{customer.postcode}</ContactInfoRow>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm text-surface-500">
                            <FileText className="h-3.5 w-3.5" />
                            <span>{stats.count} quote{stats.count !== 1 ? 's' : ''}</span>
                          </div>
                          {stats.accepted > 0 && (
                            <Badge variant="success" className="text-xs">
                              {stats.accepted} won
                            </Badge>
                          )}
                        </div>
                        {stats.value > 0 && (
                          <span className="text-sm font-medium text-surface-700">
                            {formatCurrency(stats.value)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </DashboardNavLink>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="px-6">
              {search ? (
                <EmptyState
                  icon={Users}
                  title="No customers found"
                  description="Try adjusting your search"
                >
                  <Button variant="outline" asChild>
                    <Link href="/customers">Clear search</Link>
                  </Button>
                </EmptyState>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Customers are automatically saved when you create quotes, or add them manually."
                >
                  <>
                    <AddCustomerButton hasAccess={hasActiveSubscription(profile)} />
                    <NewQuoteButton variant="outline">
                      <Plus className="h-4 w-4" />
                      Create Quote
                    </NewQuoteButton>
                  </>
                </EmptyState>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
