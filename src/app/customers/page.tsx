import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { requireAuthWithProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddCustomerButton } from "./add-customer-button";
import { CustomersSearch } from "./customers-search";

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
  
  // Get quote counts per customer
  const { data: quoteCounts } = await supabase
    .from("quotes")
    .select("customer_id")
    .eq("user_id", profile.id);

  const customerQuoteCounts = (quoteCounts || []).reduce((acc, quote) => {
    if (quote.customer_id) {
      acc[quote.customer_id] = (acc[quote.customer_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  let filteredCustomers = customers || [];
  
  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
      (customer.postcode && customer.postcode.toLowerCase().includes(searchLower))
    );
  }

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

        {/* Search */}
        <CustomersSearch currentSearch={search || ""} />

        {/* Customers List */}
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-soft transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-brand-700">
                        {customer.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-surface-900 mb-2">{customer.name}</h3>
                  
                  <div className="space-y-1.5 text-sm">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-surface-600">
                        <Mail className="h-3.5 w-3.5 text-surface-400" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-surface-600">
                        <Phone className="h-3.5 w-3.5 text-surface-400" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {customer.postcode && (
                      <div className="flex items-center gap-2 text-surface-600">
                        <MapPin className="h-3.5 w-3.5 text-surface-400" />
                        <span>{customer.postcode}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                    <div className="flex items-center gap-1.5 text-sm text-surface-500">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{customerQuoteCounts[customer.id] || 0} quotes</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/quotes/new?customer=${customer.id}`}>
                        <Plus className="h-3.5 w-3.5" />
                        Quote
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    Customers are automatically saved when you create quotes.
                  </p>
                  <Button asChild>
                    <Link href="/quotes/new">
                      <Plus className="h-4 w-4" />
                      Create your first quote
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
