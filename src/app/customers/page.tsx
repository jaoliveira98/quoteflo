import { DashboardShell } from "@/components/dashboard-shell";
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
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddCustomerButton } from "./add-customer-button";
import { CustomersSearch } from "./customers-search";
import { formatCurrency } from "@/lib/utils";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const profile = await requireAuthWithProfile();
  const supabase = await createClient();
  
  // Fetch customers
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", profile.id)
    .order("name", { ascending: true });

  // Get quote stats per customer (count and total value)
  const { data: allQuotes } = await supabase
    .from("quotes")
    .select("customer_id, customer_name, customer_email, total, status")
    .eq("user_id", profile.id);

  // Build customer stats including both linked and unlinked quotes
  const customerStats: Record<string, { count: number; value: number; accepted: number }> = {};
  
  (allQuotes || []).forEach(quote => {
    // Try to match by customer_id first
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
  
  // Apply search filter
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

  // Get count of quotes without customer_id (orphan quotes)
  const orphanQuotes = (allQuotes || []).filter(q => !q.customer_id);
  const uniqueOrphanCustomers = new Set(orphanQuotes.map(q => `${q.customer_name}|${q.customer_email || ''}`));

  return (
    <DashboardShell user={{ email: profile.email, company_name: profile.company_name }}>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Customers</h1>
            <p className="text-surface-600">
              {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
              {search && ` found`}
            </p>
          </div>
          <AddCustomerButton />
        </div>

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
                <Link key={customer.id} href={`/customers/${customer.id}`}>
                  <Card className="hover:shadow-soft hover:border-surface-300 transition-all cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-brand-700">
                            {customer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-surface-300" />
                      </div>
                      
                      <h3 className="font-semibold text-surface-900 mb-2">{customer.name}</h3>
                      
                      <div className="space-y-1.5 text-sm">
                        {allEmails.length > 0 && (
                          <div className="flex items-center gap-2 text-surface-600">
                            <Mail className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
                            <span className="truncate">{allEmails[0]}</span>
                            {allEmails.length > 1 && (
                              <Badge variant="secondary" className="text-xs">+{allEmails.length - 1}</Badge>
                            )}
                          </div>
                        )}
                        {allPhones.length > 0 && (
                          <div className="flex items-center gap-2 text-surface-600">
                            <Phone className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
                            <span>{allPhones[0]}</span>
                            {allPhones.length > 1 && (
                              <Badge variant="secondary" className="text-xs">+{allPhones.length - 1}</Badge>
                            )}
                          </div>
                        )}
                        {customer.postcode && (
                          <div className="flex items-center gap-2 text-surface-600">
                            <MapPin className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
                            <span>{customer.postcode}</span>
                          </div>
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
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              {search ? (
                <>
                  <h3 className="text-lg font-medium text-surface-900 mb-2">No customers found</h3>
                  <p className="text-surface-600 mb-6">
                    Try adjusting your search
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/customers">Clear search</Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-surface-900 mb-2">No customers yet</h3>
                  <p className="text-surface-600 mb-6">
                    Customers are automatically saved when you create quotes, or add them manually.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <AddCustomerButton />
                    <Button variant="outline" asChild>
                      <Link href="/quotes/new">
                        <Plus className="h-4 w-4" />
                        Create Quote
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
