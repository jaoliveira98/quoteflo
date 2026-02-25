"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Loader2,
  Save,
  User,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { findOrCreateCustomer } from "@/lib/customers";
import type { UserProfile, ServiceItem, Quote, QuoteLineItem } from "@/types";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
  isNew?: boolean;
}

interface EditQuoteFormProps {
  profile: UserProfile;
  quote: Quote;
  existingLineItems: QuoteLineItem[];
  services: ServiceItem[];
  hasAccess?: boolean;
}

export function EditQuoteForm({ profile, quote, existingLineItems, services, hasAccess = true }: EditQuoteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    quote.customer_id || null
  );
  const [customerName, setCustomerName] = useState(quote.customer_name);
  const [customerEmail, setCustomerEmail] = useState(quote.customer_email || "");
  const [customerPhone, setCustomerPhone] = useState(quote.customer_phone || "");
  const [customerAddress, setCustomerAddress] = useState(quote.customer_address || "");
  const [customerPostcode, setCustomerPostcode] = useState(quote.customer_postcode || "");

  const handleCustomerFieldChange = (setter: (val: string) => void) => (value: string) => {
    setter(value);
    setSelectedCustomerId(null);
  };

  const [jobDescription, setJobDescription] = useState(quote.job_description || "");
  const quoteVatRate = Number(quote.vat_rate) || 0;
  const [vatEnabled, setVatEnabled] = useState(quoteVatRate > 0);
  const [vatRate, setVatRate] = useState(quoteVatRate > 0 ? quoteVatRate : (profile.default_vat_rate ?? 20));

  const [lineItems, setLineItems] = useState<LineItem[]>(
    existingLineItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      service_id: item.service_id || undefined,
      isNew: false,
    }))
  );

  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const vatAmount = vatEnabled ? subtotal * (vatRate / 100) : 0;
  const total = subtotal + vatAmount;

  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const addLineItem = (service?: ServiceItem) => {
    if (service) {
      const existingItemIndex = lineItems.findIndex(
        item => item.service_id === service.id
      );
      
      if (existingItemIndex !== -1) {
        const updatedItems = [...lineItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        setLineItems(updatedItems);
        setShowServicePicker(false);
        setServiceSearch("");
        return;
      }
    }
    
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: service?.service_name || "",
      quantity: 1,
      unit_price: service?.price ?? 0,
      service_id: service?.id,
      isNew: true,
    };
    setLineItems([...lineItems, newItem]);
    setShowServicePicker(false);
    setServiceSearch("");
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeLineItem = (id: string) => {
    const item = lineItems.find(i => i.id === id);
    if (item && !item.isNew) {
      setDeletedItemIds([...deletedItemIds, id]);
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const autoSaveNewItems = async (supabase: ReturnType<typeof createClient>) => {
    const customItems = lineItems.filter(
      item => !item.service_id && item.description.trim() && item.isNew
    );

    for (const item of customItems) {
      const alreadyExists = services.some(
        s => s.service_name.toLowerCase() === item.description.trim().toLowerCase()
      );
      if (alreadyExists) continue;

      await supabase.from("service_library").insert({
        user_id: profile.id,
        service_name: item.description.trim(),
        category: "General",
        price: item.unit_price,
        unit: "each",
        is_active: true,
      });
    }
  };

  const handleSubmit = async () => {
    if (!hasAccess) {
      setError("Upgrade to QuoteFlo Pro to save changes.");
      return;
    }
    if (!customerName.trim()) {
      setError("Please enter a customer name");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one line item");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const customerId = await findOrCreateCustomer(supabase, profile.id, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        postcode: customerPostcode,
      }, selectedCustomerId);

      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          customer_id: customerId,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || null,
          customer_phone: customerPhone.trim() || null,
          customer_address: customerAddress.trim() || null,
          customer_postcode: customerPostcode.trim() || null,
          job_description: jobDescription || null,
          subtotal: subtotal,
          vat_rate: vatEnabled ? vatRate : 0,
          vat_amount: vatAmount,
          total: total,
        })
        .eq("id", quote.id)
        .eq("user_id", profile.id);

      if (quoteError) {
        console.error("Quote update error:", quoteError);
        throw new Error("Failed to update quote");
      }

      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("quote_line_items")
          .delete()
          .in("id", deletedItemIds);

        if (deleteError) {
          console.error("Delete items error:", deleteError);
        }
      }

      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        
        if (item.isNew) {
          await supabase
            .from("quote_line_items")
            .insert({
              quote_id: quote.id,
              item_order: i,
              service_id: item.service_id || null,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              line_total: item.quantity * item.unit_price,
            });
        } else {
          await supabase
            .from("quote_line_items")
            .update({
              item_order: i,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              line_total: item.quantity * item.unit_price,
            })
            .eq("id", item.id);
        }
      }

      // Auto-save any new custom items to the service library
      await autoSaveNewItems(supabase);

      await fetch("/api/revalidate", { method: "POST" });
      router.push(`/quotes/${quote.id}`);
      router.refresh();
    } catch (err) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to quote">
          <Link href={`/quotes/${quote.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Edit Quote</h1>
          <p className="text-surface-600">{quote.quote_number}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" aria-live="polite" role="alert">{error}</Alert>
      )}

      {/* Customer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-surface-400" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => handleCustomerFieldChange(setCustomerName)(e.target.value)}
                placeholder="John Smith"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => handleCustomerFieldChange(setCustomerEmail)(e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => handleCustomerFieldChange(setCustomerPhone)(e.target.value)}
                placeholder="07123 456789"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPostcode">Postcode</Label>
              <Input
                id="customerPostcode"
                value={customerPostcode}
                onChange={(e) => handleCustomerFieldChange(setCustomerPostcode)(e.target.value)}
                placeholder="SW1A 1AA"
                autoComplete="postal-code"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => handleCustomerFieldChange(setCustomerAddress)(e.target.value)}
              placeholder="123 Main Street, London"
              autoComplete="street-address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-surface-400" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Describe the work to be carried out..."
            className="h-24 resize-none"
          />
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Line Items</CardTitle>
            <Button onClick={() => setShowServicePicker(true)} size="sm">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length > 0 ? (
            <div className="space-y-3">
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-surface-200 bg-surface-50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Input
                        id={`line-item-description-${item.id}`}
                        name={`line-description-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        placeholder="Item description"
                        className="font-medium bg-white"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item.id)}
                      className="flex-shrink-0 text-surface-400 hover:text-red-500 hover:bg-red-50"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`line-item-qty-${item.id}`} className="text-xs text-surface-500">Qty</Label>
                      <Input
                        id={`line-item-qty-${item.id}`}
                        name={`line-qty-${item.id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`line-item-unit-price-${item.id}`} className="text-xs text-surface-500">Unit Price (£)</Label>
                      <Input
                        id={`line-item-unit-price-${item.id}`}
                        name={`line-unit-price-${item.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-surface-500">Line Total</span>
                      <div className="h-11 flex items-center font-semibold text-surface-900">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <p className="mb-4">No items added yet</p>
              <Button onClick={() => setShowServicePicker(true)} variant="outline">
                <Plus className="h-4 w-4" />
                Add your first item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totals */}
      {lineItems.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-8">
                <span className="text-surface-600">Subtotal</span>
                <span className="font-medium w-28 text-right">{formatCurrency(subtotal)}</span>
              </div>
              {vatEnabled && (
                <div className="flex items-center gap-8">
                  <span className="text-surface-600">VAT ({vatRate}%)</span>
                  <span className="font-medium w-28 text-right">{formatCurrency(vatAmount)}</span>
                </div>
              )}
              <div className="flex items-center gap-8 pt-2 border-t border-surface-200">
                <span className="text-lg font-semibold text-surface-900">Total</span>
                <span className="text-xl font-bold w-28 text-right text-brand-600">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex items-center gap-4 pt-3 mt-1 border-t border-surface-100 flex-wrap">
                <Switch
                  id="vat-toggle-edit"
                  checked={vatEnabled}
                  onCheckedChange={setVatEnabled}
                />
                <Label htmlFor="vat-toggle-edit" className="text-sm text-surface-500 cursor-pointer">
                  Include VAT
                </Label>
                {vatEnabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      id="vat-rate-edit"
                      name="vatRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={vatRate}
                      onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                      className="w-16 h-8 text-sm"
                    />
                    <span className="text-sm text-surface-500">%</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" asChild>
          <Link href={`/quotes/${quote.id}`}>Cancel</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !hasAccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Service Picker Dialog */}
      <Dialog open={showServicePicker} onOpenChange={(open) => { setShowServicePicker(open); if (!open) setServiceSearch(""); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Add Line Item</DialogTitle>
            <DialogDescription>
              Choose from your saved items or add a custom one.
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 pb-3 border-b border-surface-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                id="service-search"
                name="serviceSearch"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9"
                autoFocus
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Custom item option */}
            <Button
              variant="outline"
              onClick={() => addLineItem()}
              className="w-full justify-start p-3 h-auto rounded-lg border-2 border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50 mb-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-surface-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-surface-900">Custom Item</p>
                  <p className="text-sm text-surface-500 font-normal">Add a custom line item (auto-saved to your library)</p>
                </div>
              </div>
            </Button>

            {/* Service library */}
            {Object.keys(groupedServices).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedServices).map(([category, categoryServices]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categoryServices.map(service => (
                        <Button
                          key={service.id}
                          variant="outline"
                          onClick={() => addLineItem(service)}
                          className="w-full justify-start p-3 h-auto rounded-lg border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                        >
                          <div className="w-full flex items-center justify-between">
                            <div className="text-left">
                              <p className="font-medium text-surface-900">{service.service_name}</p>
                              {service.description && (
                                <p className="text-sm text-surface-500 font-normal">{service.description}</p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="font-medium text-surface-900">
                                {formatCurrency(service.price)}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 && !serviceSearch ? (
              <p className="text-center text-surface-500 py-4 text-sm">
                You haven&apos;t added any items yet. Add custom items above, or go to{" "}
                <a href="/services" className="text-brand-600 hover:underline font-medium">
                  Services & Items
                </a>{" "}
                to build your library.
              </p>
            ) : (
              <p className="text-center text-surface-500 py-8">
                No items found matching &quot;{serviceSearch}&quot;
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
