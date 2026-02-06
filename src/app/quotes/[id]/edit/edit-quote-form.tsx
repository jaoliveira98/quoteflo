"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Loader2,
  Save,
  User,
  FileText,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { UserProfile, ServiceItem, Quote, QuoteLineItem } from "@/types";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
  isNew?: boolean; // Track if this is a new item
}

interface EditQuoteFormProps {
  profile: UserProfile;
  quote: Quote;
  existingLineItems: QuoteLineItem[];
  services: ServiceItem[];
}

export function EditQuoteForm({ profile, quote, existingLineItems, services }: EditQuoteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  // Customer details
  const [customerName, setCustomerName] = useState(quote.customer_name);
  const [customerEmail, setCustomerEmail] = useState(quote.customer_email || "");
  const [customerPhone, setCustomerPhone] = useState(quote.customer_phone || "");
  const [customerAddress, setCustomerAddress] = useState(quote.customer_address || "");
  const [customerPostcode, setCustomerPostcode] = useState(quote.customer_postcode || "");

  // Quote details
  const [jobDescription, setJobDescription] = useState(quote.job_description || "");
  const [vatRate, setVatRate] = useState(Number(quote.vat_rate) || 20);

  // Line items - convert existing items to editable format
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

  // Track deleted items
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    service.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Group services by category
  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const addLineItem = (service?: ServiceItem) => {
    // Check if this service is already in the line items
    if (service) {
      const existingItemIndex = lineItems.findIndex(
        item => item.service_id === service.id
      );
      
      if (existingItemIndex !== -1) {
        // Increment quantity of existing item
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
    
    // Add new item
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: service?.service_name || "",
      quantity: 1,
      unit_price: service ? (service.typical_price_min + service.typical_price_max) / 2 : 0,
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
      // Track deletion of existing items
      setDeletedItemIds([...deletedItemIds, id]);
    }
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleSubmit = async () => {
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

      // Update quote
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          customer_name: customerName,
          customer_email: customerEmail || null,
          customer_phone: customerPhone || null,
          customer_address: customerAddress || null,
          customer_postcode: customerPostcode || null,
          job_description: jobDescription || null,
          subtotal: subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total: total,
        })
        .eq("id", quote.id)
        .eq("user_id", profile.id);

      if (quoteError) {
        console.error("Quote update error:", quoteError);
        throw new Error("Failed to update quote");
      }

      // Delete removed line items
      if (deletedItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("quote_line_items")
          .delete()
          .in("id", deletedItemIds);

        if (deleteError) {
          console.error("Delete items error:", deleteError);
        }
      }

      // Update existing items and insert new ones
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        
        if (item.isNew) {
          // Insert new item
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
          // Update existing item
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

      // Redirect to quote detail page
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
        <Button variant="ghost" size="icon" asChild>
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
        <div className="p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
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
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="07123 456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPostcode">Postcode</Label>
              <Input
                id="customerPostcode"
                value={customerPostcode}
                onChange={(e) => setCustomerPostcode(e.target.value)}
                placeholder="SW1A 1AA"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="123 Main Street, London"
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
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Describe the work to be carried out..."
            className="w-full h-24 px-4 py-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
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
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        placeholder="Item description"
                        className="font-medium bg-white"
                      />
                    </div>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-surface-500">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-surface-500">Unit Price (£)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-surface-500">Line Total</Label>
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
              <div className="flex items-center gap-8">
                <span className="text-surface-600">VAT ({vatRate}%)</span>
                <span className="font-medium w-28 text-right">{formatCurrency(vatAmount)}</span>
              </div>
              <div className="flex items-center gap-8 pt-2 border-t border-surface-200">
                <span className="text-lg font-semibold text-surface-900">Total</span>
                <span className="text-xl font-bold w-28 text-right text-brand-600">
                  {formatCurrency(total)}
                </span>
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
          disabled={isLoading}
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

      {/* Service Picker Modal */}
      {showServicePicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-strong w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-slide-up sm:animate-scale-in">
            <div className="flex flex-col">
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-surface-300" />
              </div>
              <div className="flex items-center justify-between p-4 border-b border-surface-200">
                <h3 className="font-semibold text-surface-900">Add Line Item</h3>
                <button
                  onClick={() => { setShowServicePicker(false); setServiceSearch(""); }}
                  className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-surface-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search services..."
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Custom item option */}
              <button
                onClick={() => addLineItem()}
                className="w-full text-left p-3 rounded-lg border-2 border-dashed border-surface-300 hover:border-brand-400 hover:bg-brand-50 mb-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-surface-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-surface-500" />
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Custom Item</p>
                    <p className="text-sm text-surface-500">Add a custom line item</p>
                  </div>
                </div>
              </button>

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
                          <button
                            key={service.id}
                            onClick={() => addLineItem(service)}
                            className="w-full text-left p-3 rounded-lg border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-surface-900">{service.service_name}</p>
                                {service.description && (
                                  <p className="text-sm text-surface-500">{service.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-surface-900">
                                  {formatCurrency((service.typical_price_min + service.typical_price_max) / 2)}
                                </p>
                                <p className="text-xs text-surface-500">
                                  {formatCurrency(service.typical_price_min)} - {formatCurrency(service.typical_price_max)}
                                </p>
                              </div>
                            </div>
                            {(service.part_p_required || service.gas_safe_required || service.building_reg_required) && (
                              <div className="flex gap-1 mt-2">
                                {service.part_p_required && (
                                  <Badge variant="info" className="text-xs">Part P</Badge>
                                )}
                                {service.gas_safe_required && (
                                  <Badge variant="warning" className="text-xs">Gas Safe</Badge>
                                )}
                                {service.building_reg_required && (
                                  <Badge variant="secondary" className="text-xs">Building Regs</Badge>
                                )}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-surface-500 py-8">
                  No services found matching &quot;{serviceSearch}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
