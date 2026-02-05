"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Merge,
  X,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Customer } from "@/types";

interface CustomerActionsProps {
  customer: Customer;
  otherCustomers: { id: string; name: string; email: string | null }[];
}

export function CustomerActions({ customer, otherCustomers }: CustomerActionsProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
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
      
      // First, unlink any quotes from this customer
      await supabase
        .from("quotes")
        .update({ customer_id: null })
        .eq("customer_id", customer.id);

      // Then delete the customer
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
      
      // Call the merge function via RPC
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
      {/* Menu Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-200 z-50 py-1">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEditModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
              >
                <Pencil className="h-4 w-4" />
                Edit Customer
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowMergeModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50"
              >
                <Merge className="h-4 w-4" />
                Merge with Another
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Customer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditModal(false)}
          />
          <Card className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Customer</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
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
                <textarea
                  id="notes"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any notes about this customer..."
                  className="w-full min-h-[100px] px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />
          <Card className="relative w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <p className="text-surface-600">
                Are you sure you want to delete <strong>{customer.name}</strong>?
              </p>
              <p className="text-sm text-surface-500">
                This will remove the customer from your list. Any quotes associated
                with this customer will be kept but unlinked.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Delete Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMergeModal(false)}
          />
          <Card className="relative w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Merge className="h-5 w-5" />
                Merge Customers
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMergeModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <p className="text-surface-600">
                Select a customer to merge into <strong>{customer.name}</strong>.
                Their contact details and quotes will be combined.
              </p>

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
                    <button
                      key={c.id}
                      onClick={() => setMergeTargetId(c.id)}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-surface-50 border-b border-surface-100 last:border-0 ${
                        mergeTargetId === c.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-surface-200 flex items-center justify-center text-xs font-medium">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 truncate">
                          {c.name}
                        </p>
                        {c.email && (
                          <p className="text-sm text-surface-500 truncate">
                            {c.email}
                          </p>
                        )}
                      </div>
                      {mergeTargetId === c.id && (
                        <div className="h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center">
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-surface-500">
                    No other customers found
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
