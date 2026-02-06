"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert } from "@/components/ui/alert";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Merge,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types";

interface CustomerActionsProps {
  customer: Customer;
  otherCustomers: { id: string; name: string; email: string | null }[];
}

export function CustomerActions({ customer, otherCustomers }: CustomerActionsProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: customer.name,
    emails: [...(customer.emails || []), ...(customer.email && !customer.emails?.includes(customer.email) ? [customer.email] : [])].filter(Boolean),
    phones: [...(customer.phones || []), ...(customer.phone && !customer.phones?.includes(customer.phone) ? [customer.phone] : [])].filter(Boolean),
    address: customer.address || "",
    postcode: customer.postcode || "",
    notes: customer.notes || "",
  });

  // Merge state
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [mergeSearch, setMergeSearch] = useState("");

  const filteredCustomers = otherCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(mergeSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(mergeSearch.toLowerCase()))
  );

  const handleEdit = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("customers")
        .update({
          name: editForm.name,
          email: editForm.emails[0] || null,
          phone: editForm.phones[0] || null,
          emails: editForm.emails.filter(Boolean),
          phones: editForm.phones.filter(Boolean),
          address: editForm.address || null,
          postcode: editForm.postcode || null,
          notes: editForm.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id);

      if (updateError) throw updateError;

      setShowEditModal(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      await supabase
        .from("quotes")
        .update({ customer_id: null })
        .eq("customer_id", customer.id);

      const { error: deleteError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (deleteError) throw deleteError;

      router.push("/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
      setLoading(false);
    }
  };

  const handleMerge = async () => {
    if (!mergeTargetId) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error: mergeError } = await supabase.rpc("merge_customers", {
        p_user_id: customer.user_id,
        p_primary_customer_id: customer.id,
        p_secondary_customer_id: mergeTargetId,
      });

      if (mergeError) throw mergeError;

      setShowMergeModal(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to merge customers");
    } finally {
      setLoading(false);
    }
  };

  const addEmail = () => {
    setEditForm((prev) => ({ ...prev, emails: [...prev.emails, ""] }));
  };

  const updateEmail = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      emails: prev.emails.map((e, i) => (i === index ? value : e)),
    }));
  };

  const removeEmail = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index),
    }));
  };

  const addPhone = () => {
    setEditForm((prev) => ({ ...prev, phones: [...prev.phones, ""] }));
  };

  const updatePhone = (index: number, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      phones: prev.phones.map((p, i) => (i === index ? value : p)),
    }));
  };

  const removePhone = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Customer actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
            <Pencil className="h-4 w-4" />
            Edit Customer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowMergeModal(true)}>
            <Merge className="h-4 w-4" />
            Merge with Another
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Customer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer&apos;s details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Customer name"
              />
            </div>

            {/* Emails */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Email Addresses</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addEmail}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {editForm.emails.length === 0 ? (
                  <p className="text-sm text-surface-500">No email addresses</p>
                ) : (
                  editForm.emails.map((email, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(i, e.target.value)}
                        placeholder="email@example.com"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEmail(i)}
                        aria-label="Remove email"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Phones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Phone Numbers</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addPhone}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {editForm.phones.length === 0 ? (
                  <p className="text-sm text-surface-500">No phone numbers</p>
                ) : (
                  editForm.phones.map((phone, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhone(i, e.target.value)}
                        placeholder="07123 456789"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhone(i)}
                        aria-label="Remove phone"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Street address"
              />
            </div>

            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={editForm.postcode}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, postcode: e.target.value }))
                }
                placeholder="AB1 2CD"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any notes about this customer..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading || !editForm.name}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{customer.name}</strong>?
              This will remove the customer from your list. Any quotes associated
              with this customer will be kept but unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <Alert variant="destructive">{error}</Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeModal} onOpenChange={setShowMergeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Merge className="h-5 w-5" />
              Merge Customers
            </DialogTitle>
            <DialogDescription>
              Select a customer to merge into <strong>{customer.name}</strong>.
              Their contact details and quotes will be combined.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}

            <div>
              <Label htmlFor="search">Search customers</Label>
              <Input
                id="search"
                value={mergeSearch}
                onChange={(e) => setMergeSearch(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>

            <div className="max-h-60 overflow-y-auto border border-surface-200 rounded-lg">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <Button
                    key={c.id}
                    variant="ghost"
                    onClick={() => setMergeTargetId(c.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 h-auto justify-start rounded-none border-b border-surface-100 last:border-0",
                      mergeTargetId === c.id ? "bg-brand-50 hover:bg-brand-50" : ""
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-surface-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-surface-900 truncate">
                        {c.name}
                      </p>
                      {c.email && (
                        <p className="text-sm text-surface-500 truncate font-normal">
                          {c.email}
                        </p>
                      )}
                    </div>
                    {mergeTargetId === c.id && (
                      <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </Button>
                ))
              ) : (
                <p className="p-4 text-center text-surface-500">
                  No other customers found
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMergeModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={loading || !mergeTargetId}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Merge Customers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
