"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Loader2,
  Search,
  Package,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { UserProfile, ServiceItem } from "@/types";

interface ServicesManagerProps {
  profile: UserProfile;
  initialServices: ServiceItem[];
  hasAccess?: boolean;
}

interface ServiceFormData {
  service_name: string;
  description: string;
  category: string;
  price: number;
  unit: ServiceItem["unit"];
}

const UNIT_LABELS: Record<ServiceItem["unit"], string> = {
  each: "Each",
  per_hour: "Per Hour",
  per_metre: "Per Metre",
  per_room: "Per Room",
  per_day: "Per Day",
};

const emptyForm: ServiceFormData = {
  service_name: "",
  description: "",
  category: "",
  price: 0,
  unit: "each",
};

export function ServicesManager({ profile, initialServices, hasAccess = true }: ServicesManagerProps) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const categories = [...new Set(services.map(s => s.category))].sort();

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(formData.category.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.service_name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    const cat = service.category || "Uncategorised";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

  const openAddDialog = () => {
    setEditingService(null);
    setFormData(emptyForm);
    setError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description || "",
      category: service.category,
      price: service.price,
      unit: service.unit,
    });
    setError(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!hasAccess) {
      setError("Upgrade to QuoteFlo Pro to manage services.");
      return;
    }
    if (!formData.service_name.trim()) {
      setError("Service name is required");
      return;
    }
    if (!formData.category.trim()) {
      setError("Category is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (editingService) {
        const { error: updateError } = await supabase
          .from("service_library")
          .update({
            service_name: formData.service_name.trim(),
            description: formData.description.trim() || null,
            category: formData.category.trim(),
            price: formData.price,
            unit: formData.unit,
          })
          .eq("id", editingService.id)
          .eq("user_id", profile.id);

        if (updateError) throw updateError;

        setServices(
          services.map((s) =>
            s.id === editingService.id
              ? {
                  ...s,
                  service_name: formData.service_name.trim(),
                  description: formData.description.trim() || null,
                  category: formData.category.trim(),
                  price: formData.price,
                  unit: formData.unit,
                }
              : s
          )
        );
      } else {
        const { data: newService, error: insertError } = await supabase
          .from("service_library")
          .insert({
            user_id: profile.id,
            service_name: formData.service_name.trim(),
            description: formData.description.trim() || null,
            category: formData.category.trim(),
            price: formData.price,
            unit: formData.unit,
            is_active: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setServices([...services, newService as ServiceItem]);
      }

      setIsDialogOpen(false);
      await fetch("/api/revalidate", { method: "POST" });
      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!hasAccess) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("service_library")
        .delete()
        .eq("id", id)
        .eq("user_id", profile.id);

      if (deleteError) throw deleteError;

      setServices(services.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      await fetch("/api/revalidate", { method: "POST" });
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Services & Items</h1>
          <p className="text-surface-600">
            Manage your reusable items for quick quote building
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={!hasAccess} title={!hasAccess ? "Upgrade to add items" : undefined}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      {services.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="pl-9"
          />
        </div>
      )}

      {/* Services List */}
      {Object.keys(groupedServices).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-surface-500 uppercase tracking-wider">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className="relative flex items-center gap-4 p-4 rounded-lg border border-surface-200 bg-white hover:border-surface-300 transition-colors group flex-nowrap"
                  >
                    <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-900 truncate">
                        {service.service_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-surface-500">
                        {service.description && (
                          <span className="truncate">{service.description}</span>
                        )}
                        <span className="flex-shrink-0">
                          {UNIT_LABELS[service.unit]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right tabular-nums">
                      <p className="font-semibold text-surface-900">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 group-hover:bg-white pl-2 shadow-sm rounded">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => hasAccess && openEditDialog(service)}
                        disabled={!hasAccess}
                        className="h-8 w-8 text-surface-400 hover:text-surface-600"
                        title={hasAccess ? "Edit" : "Upgrade to edit"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => hasAccess && setDeleteConfirm(service.id)}
                        disabled={!hasAccess}
                        className="h-8 w-8 text-surface-400 hover:text-red-500 hover:bg-red-50"
                        title={hasAccess ? "Delete" : "Upgrade to delete"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-surface-400" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-1">
                {search ? "No items found" : "No items yet"}
              </h3>
              <p className="text-surface-600 text-sm mb-5 max-w-sm mx-auto">
                {search
                  ? `No items matching "${search}"`
                  : "Add your commonly used products, services, or line items to speed up quote creation."}
              </p>
              {!search && (
                <Button onClick={openAddDialog} disabled={!hasAccess} title={!hasAccess ? "Upgrade to add items" : undefined}>
                  <Plus className="h-4 w-4" />
                  Add your first item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Item" : "Add Item"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Update this item"
                : "Add a reusable item to your library"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Name *</Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) =>
                  setFormData({ ...formData, service_name: e.target.value })
                }
                placeholder="e.g. Consultation, Widget, Hourly Rate"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description (optional)"
              />
            </div>

            <div className="space-y-2" ref={categoryRef}>
              <Label htmlFor="category">Category *</Label>
              <div className="relative">
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="e.g. Services, Products, Labour"
                  className="pr-9"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  tabIndex={-1}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-auto w-auto p-0 text-surface-400 hover:text-surface-600 transition-colors"
                  aria-label="Toggle category suggestions"
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    showCategoryDropdown && "rotate-180"
                  )} />
                </Button>

                {showCategoryDropdown && filteredCategories.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-medium max-h-48 overflow-y-auto">
                    {filteredCategories.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setFormData({ ...formData, category: cat });
                          setShowCategoryDropdown(false);
                        }}
                        className={cn(
                          "w-full justify-start px-4 py-2.5 h-auto text-sm transition-colors hover:bg-surface-50 border-b border-surface-100 last:border-0 rounded-none",
                          formData.category === cat && "bg-brand-50 text-brand-700 font-medium"
                        )}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {formData.category && !categories.includes(formData.category) && formData.category.trim() && (
                <p className="text-xs text-surface-500">
                  New category &ldquo;{formData.category.trim()}&rdquo; will be created
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (£)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      unit: value as ServiceItem["unit"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingService ? (
                "Save Changes"
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  );
}
