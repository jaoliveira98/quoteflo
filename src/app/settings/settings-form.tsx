"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Palette, 
  CreditCard, 
  Loader2, 
  Check,
  Zap,
  Wrench,
  Hammer,
  AlertCircle,
  Bell
} from "lucide-react";
import type { UserProfile } from "@/types";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  profile: UserProfile;
}

const trades = [
  { value: "electrician", label: "Electrician", icon: Zap },
  { value: "plumber", label: "Plumber", icon: Wrench },
  { value: "builder", label: "Builder", icon: Hammer },
] as const;

const brandColors = [
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#f97316", label: "Orange" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#0f172a", label: "Dark" },
];

export function SettingsForm({ profile }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: profile.company_name || "",
    phone: profile.phone || "",
    postcode: profile.postcode || "",
    trade: profile.trade,
    brand_color: profile.brand_color || "#22c55e",
    // Notification preferences
    auto_followup_enabled: profile.auto_followup_enabled ?? true,
    auto_followup_days: profile.auto_followup_days ?? 3,
    expiry_reminder_enabled: profile.expiry_reminder_enabled ?? true,
    expiry_reminder_days: profile.expiry_reminder_days ?? 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          company_name: formData.company_name,
          phone: formData.phone || null,
          postcode: formData.postcode || null,
          trade: formData.trade,
          brand_color: formData.brand_color,
          // Notification preferences
          auto_followup_enabled: formData.auto_followup_enabled,
          auto_followup_days: formData.auto_followup_days,
          expiry_reminder_enabled: formData.expiry_reminder_enabled,
          expiry_reminder_days: formData.expiry_reminder_days,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      router.refresh();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-surface-400" />
            Company Details
          </CardTitle>
          <CardDescription>
            This information appears on your quotes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company / Trading Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. Smith Electrical Services"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="07123 456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Business Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="SW1A 1AA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trade</Label>
            <div className="grid grid-cols-3 gap-3">
              {trades.map((trade) => (
                <button
                  key={trade.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, trade: trade.value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    formData.trade === trade.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-surface-200 hover:border-surface-300"
                  )}
                >
                  <trade.icon className={cn(
                    "h-6 w-6",
                    formData.trade === trade.value ? "text-brand-600" : "text-surface-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    formData.trade === trade.value ? "text-brand-700" : "text-surface-600"
                  )}>
                    {trade.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-surface-500">
              This determines which services appear in your quote builder
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-surface-400" />
            Branding
          </CardTitle>
          <CardDescription>
            Customize how your quotes look
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Brand Color</Label>
            <div className="flex flex-wrap gap-2">
              {brandColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, brand_color: color.value })}
                  className={cn(
                    "h-10 w-10 rounded-lg border-2 transition-all",
                    formData.brand_color === color.value
                      ? "border-surface-900 scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <p className="text-xs text-surface-500">
              This color will be used on your quotes and customer-facing pages
            </p>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t border-surface-200">
            <Label className="text-surface-500">Preview</Label>
            <div className="mt-2 p-4 rounded-lg border border-surface-200 bg-white">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.brand_color }}
                >
                  {formData.company_name.charAt(0) || "Q"}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: formData.brand_color }}>
                    {formData.company_name || "Your Company"}
                  </p>
                  <p className="text-sm text-surface-500">
                    {formData.phone || "Phone number"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-surface-400" />
            Automated Follow-ups
          </CardTitle>
          <CardDescription>
            Automatically chase unviewed quotes and remind customers before expiry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900">Auto follow-up emails</p>
                <p className="text-sm text-surface-500">
                  Send automatic reminders for quotes that haven't been viewed
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.auto_followup_enabled}
                onClick={() => setFormData({ ...formData, auto_followup_enabled: !formData.auto_followup_enabled })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  formData.auto_followup_enabled ? "bg-brand-500" : "bg-surface-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                    formData.auto_followup_enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            
            {formData.auto_followup_enabled && (
              <div className="ml-0 pl-0 border-l-0 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                  <Label htmlFor="auto_followup_days" className="text-sm text-surface-600 whitespace-nowrap">
                    Send first follow-up after
                  </Label>
                  <select
                    id="auto_followup_days"
                    value={formData.auto_followup_days}
                    onChange={(e) => setFormData({ ...formData, auto_followup_days: Number(e.target.value) })}
                    className="w-24 h-9 rounded-md border border-surface-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>1 day</option>
                    <option value={2}>2 days</option>
                    <option value={3}>3 days</option>
                    <option value={5}>5 days</option>
                    <option value={7}>7 days</option>
                  </select>
                </div>
                <p className="text-xs text-surface-500">
                  Up to 3 follow-up emails will be sent automatically. Subsequent emails are sent 3 days apart.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-surface-200 pt-6">
            {/* Expiry Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900">Quote expiry reminders</p>
                <p className="text-sm text-surface-500">
                  Remind customers before their quote expires
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.expiry_reminder_enabled}
                onClick={() => setFormData({ ...formData, expiry_reminder_enabled: !formData.expiry_reminder_enabled })}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  formData.expiry_reminder_enabled ? "bg-brand-500" : "bg-surface-200"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                    formData.expiry_reminder_enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
            
            {formData.expiry_reminder_enabled && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                  <Label htmlFor="expiry_reminder_days" className="text-sm text-surface-600 whitespace-nowrap">
                    Send reminder
                  </Label>
                  <select
                    id="expiry_reminder_days"
                    value={formData.expiry_reminder_days}
                    onChange={(e) => setFormData({ ...formData, expiry_reminder_days: Number(e.target.value) })}
                    className="w-32 h-9 rounded-md border border-surface-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={1}>1 day before</option>
                    <option value={2}>2 days before</option>
                    <option value={3}>3 days before</option>
                    <option value={5}>5 days before</option>
                    <option value={7}>7 days before</option>
                  </select>
                  <span className="text-sm text-surface-600">expiry</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-surface-400" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-50">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-surface-900">
                  {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)} Plan
                </p>
                <Badge variant={profile.subscription_status === "active" ? "success" : "warning"}>
                  {profile.subscription_status === "trialing" ? "Trial" : profile.subscription_status}
                </Badge>
              </div>
              <p className="text-sm text-surface-500 mt-1">
                {profile.subscription_tier === "professional" 
                  ? "Unlimited quotes, all features included"
                  : "Upgrade for unlimited quotes"}
              </p>
            </div>
            <Button variant="outline" disabled>
              Manage
            </Button>
          </div>
          <p className="text-xs text-surface-500 mt-3">
            Billing management coming soon. Contact support for any billing queries.
          </p>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 flex items-center gap-2">
          <Check className="h-5 w-5 flex-shrink-0" />
          Settings saved successfully!
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
