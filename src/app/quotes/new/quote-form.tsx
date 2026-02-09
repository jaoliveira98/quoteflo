"use client";

import { useState, useRef, useEffect } from "react";
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
  Send,
  User,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { findOrCreateCustomer } from "@/lib/customers";
import type { UserProfile, ServiceItem, Customer } from "@/types";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  service_id?: string;
}

interface QuoteFormProps {
  profile: UserProfile;
  services: ServiceItem[];
  customers: Customer[];
  preselectedCustomer?: Customer | null;
}

export function QuoteForm({ profile, services, customers, preselectedCustomer }: QuoteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  
  // Customer search state
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerSearchRef = useRef<HTMLDivElement>(null);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    preselectedCustomer?.id || null
  );
  const [customerName, setCustomerName] = useState(preselectedCustomer?.name || "");
  const [customerEmail, setCustomerEmail] = useState(preselectedCustomer?.email || "");
  const [customerPhone, setCustomerPhone] = useState(preselectedCustomer?.phone || "");
  const [customerAddress, setCustomerAddress] = useState(preselectedCustomer?.address || "");
  const [customerPostcode, setCustomerPostcode] = useState(preselectedCustomer?.postcode || "");

  const handleCustomerFieldChange = (setter: (val: string) => void) => (value: string) => {
    setter(value);
    setSelectedCustomerId(null);
  };
  
  const [jobDescription, setJobDescription] = useState("");
  const [vatEnabled, setVatEnabled] = useState(profile.vat_enabled ?? true);
  const [vatRate, setVatRate] = useState(profile.default_vat_rate ?? 20);
  const [validDays, setValidDays] = useState(profile.default_quote_expiry_days ?? 30);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const vatAmount = vatEnabled ? subtotal * (vatRate / 100) : 0;
  const total = subtotal + vatAmount;

  // Customer search filtering
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email || "");
    setCustomerPhone(customer.phone || "");
    setCustomerAddress(customer.address || "");
    setCustomerPostcode(customer.postcode || "");
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  };

  const autoSaveNewItems = async (supabase: ReturnType<typeof createClient>) => {
    const customItems = lineItems.filter(
      item => !item.service_id && item.description.trim()
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

  const handleSubmit = async (status: "draft" | "sent") => {
    if (!customerName.trim()) {
      setError("Please enter a customer name");
      return;
    }
    
    if (lineItems.length === 0) {
      setError("Please add at least one line item");
      return;
    }

    if (status === "sent" && !customerEmail.trim()) {
      setError("Customer email is required to send a quote. Save as draft or add an email address.");
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

      const { data: quoteNumber, error: rpcError } = await supabase
        .rpc("generate_quote_number", { p_user_id: profile.id });
      
      if (rpcError) {
        console.error("Quote number error:", rpcError);
        throw new Error("Failed to generate quote number");
      }

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: profile.id,
          quote_number: quoteNumber,
          customer_id: customerId,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || null,
          customer_phone: customerPhone.trim() || null,
          customer_address: customerAddress.trim() || null,
          customer_postcode: customerPostcode.trim() || null,
          job_description: jobDescription || null,
          status: "draft",
          subtotal: subtotal,
          vat_rate: vatEnabled ? vatRate : 0,
          vat_amount: vatAmount,
          total: total,
          valid_until: validUntil.toISOString().split("T")[0],
        })
        .select()
        .single();

      if (quoteError) {
        console.error("Quote creation error:", quoteError);
        throw new Error("Failed to create quote");
      }

      const lineItemsToInsert = lineItems.map((item, index) => ({
        quote_id: quote.id,
        item_order: index,
        service_id: item.service_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("quote_line_items")
        .insert(lineItemsToInsert);

      if (itemsError) {
        console.error("Line items error:", itemsError);
        throw new Error("Failed to create line items");
      }

      // Auto-save any new custom items to the service library
      await autoSaveNewItems(supabase);

      if (status === "sent") {
        const sendResponse = await fetch(`/api/quotes/${quote.id}/send`, {
          method: "POST",
        });

        if (!sendResponse.ok) {
          const sendData = await sendResponse.json();
          console.error("Send error:", sendData);
        }
      }

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
        <Button variant="ghost" size="icon" asChild aria-label="Back to quotes">
          <Link href="/quotes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">New Quote</h1>
          <p className="text-surface-600">Create a professional quote</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
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
          {/* Customer search */}
          {customers.length > 0 && (
            <div ref={customerSearchRef} className="relative pb-4 border-b border-surface-200">
              <Label className="text-sm text-surface-500 mb-2 block">Search existing customers</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                <Input
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search by name, email, or phone..."
                  className="pl-9 pr-9"
                />
                {customerSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => { setCustomerSearch(""); setShowCustomerDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-auto w-auto p-0 text-surface-400 hover:text-surface-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {showCustomerDropdown && (customerSearch || filteredCustomers.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-medium max-h-60 overflow-y-auto">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.slice(0, 10).map(customer => (
                      <Button
                        key={customer.id}
                        type="button"
                        variant="ghost"
                        onClick={() => selectCustomer(customer)}
                        className={cn(
                          "w-full justify-start px-4 py-3 h-auto hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-0 rounded-none",
                          selectedCustomerId === customer.id && "bg-brand-50"
                        )}
                      >
                        <p className="font-medium text-surface-900">{customer.name}</p>
                        <div className="flex items-center gap-3 text-sm text-surface-500">
                          {customer.email && <span>{customer.email}</span>}
                          {customer.phone && <span>{customer.phone}</span>}
                        </div>
                      </Button>
                    ))
                  ) : customerSearch ? (
                    <div className="px-4 py-3 text-sm text-surface-500">
                      No customers found matching &quot;{customerSearch}&quot;
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => handleCustomerFieldChange(setCustomerName)(e.target.value)}
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
                onChange={(e) => handleCustomerFieldChange(setCustomerEmail)(e.target.value)}
                placeholder="john@example.com"
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPostcode">Postcode</Label>
              <Input
                id="customerPostcode"
                value={customerPostcode}
                onChange={(e) => handleCustomerFieldChange(setCustomerPostcode)(e.target.value)}
                placeholder="SW1A 1AA"
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
              {vatEnabled && (
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-surface-600">VAT ({vatRate}%)</span>
                  </div>
                  <span className="font-medium w-28 text-right">{formatCurrency(vatAmount)}</span>
                </div>
              )}
              <div className="flex items-center gap-8 pt-2 border-t border-surface-200">
                <span className="text-lg font-semibold text-surface-900">Total</span>
                <span className="text-xl font-bold w-28 text-right text-brand-600">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 mt-1 border-t border-surface-100">
                <Switch
                  id="vat-toggle"
                  checked={vatEnabled}
                  onCheckedChange={setVatEnabled}
                />
                <Label htmlFor="vat-toggle" className="text-sm text-surface-500 cursor-pointer">
                  Include VAT
                </Label>
                {vatEnabled && (
                  <div className="flex items-center gap-1 ml-2">
                    <Input
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
        <Button 
          variant="outline" 
          onClick={() => handleSubmit("draft")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save as Draft
        </Button>
        <Button 
          onClick={() => handleSubmit("sent")}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Save & Send Quote
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
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-9"
                autoFocus
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
