"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Building2, 
  Palette, 
  CreditCard, 
  Loader2, 
  Check,
  Bell,
  Crown,
  ExternalLink,
  Clock,
  KeyRound,
  CalendarDays,
  Receipt,
  RotateCcw,
  Trash2,
  Download,
} from "lucide-react";
import type { UserProfile, Trade } from "@/types";
import { cn } from "@/lib/utils";
import { TRADES_CONFIG, BRAND_COLORS } from "@/lib/constants";
import { Suspense } from "react";

// ──────────────────────────────────────────────
// Shared components
// ──────────────────────────────────────────────

interface SettingsFormProps {
  profile: UserProfile;
}

function CardActions({
  isLoading,
  success,
  isDirty,
  onUndo,
}: {
  isLoading: boolean;
  success: boolean;
  isDirty: boolean;
  onUndo: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-surface-100">
      {isDirty && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onUndo}
          className="text-surface-500 hover:text-surface-700 gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Undo
        </Button>
      )}
      <Button type="submit" disabled={isLoading || !isDirty} size="sm" className="min-w-[80px]">
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving…
          </>
        ) : success ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Saved
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Subscription Card
// ──────────────────────────────────────────────

function SubscriptionCard({ profile }: { profile: UserProfile }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  
  const isTrialing = profile.subscription_status === "trialing";
  const isActive = profile.subscription_status === "active";
  const isPastDue = profile.subscription_status === "past_due";
  const hasStripeCustomer = !!profile.stripe_customer_id;
  
  const trialDaysRemaining = profile.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };
  
  const handleManageBilling = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }
      
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-surface-400" />
          Plan &amp; Billing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert variant="success">
            Welcome to Professional! Your subscription is now active.
          </Alert>
        )}
        {canceled && (
          <Alert variant="warning">
            Checkout was canceled. No charges were made.
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-surface-50">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-surface-900">
                {isActive ? "Professional" : isTrialing ? "Free Trial" : "Starter"} Plan
              </p>
              {isActive && (
                <Badge variant="success" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Active
                </Badge>
              )}
              {isTrialing && trialDaysRemaining > 0 && (
                <Badge variant="warning" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {trialDaysRemaining} days left
                </Badge>
              )}
              {isTrialing && trialDaysRemaining === 0 && (
                <Badge variant="secondary">Trial expired</Badge>
              )}
              {isPastDue && (
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  Payment failed
                </Badge>
              )}
            </div>
            <p className="text-sm text-surface-500 mt-1">
              {isActive 
                ? "Unlimited quotes, all features included"
                : isTrialing && trialDaysRemaining > 0
                  ? "Full access during trial period"
                  : "Upgrade to continue creating quotes"
              }
            </p>
          </div>
          <div className="flex-shrink-0">
            {isActive || hasStripeCustomer ? (
              <Button 
                variant="outline" 
                onClick={handleManageBilling}
                disabled={isLoading}
                size="sm"
                className="gap-1.5 w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Manage
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleUpgrade} disabled={isLoading} size="sm" className="gap-1.5 w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    Upgrade - £29/mo
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {isTrialing && (
          <div className="p-4 rounded-lg border-2 border-brand-200 bg-brand-50">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Crown className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-surface-900">Upgrade to Professional</p>
                <p className="text-sm text-surface-600 mt-1">
                  Keep creating unlimited quotes with PDF generation, email sending, and auto follow-ups.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-surface-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-600" />
                    Unlimited quotes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-600" />
                    PDF generation & email sending
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-600" />
                    Automated follow-ups
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-600" />
                    Priority support
                  </li>
                </ul>
                {!hasStripeCustomer && (
                  <Button onClick={handleUpgrade} disabled={isLoading} className="mt-4 gap-1.5" size="sm">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Crown className="h-4 w-4" />
                        Upgrade Now - £29/month
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionCardWrapper({ profile }: { profile: UserProfile }) {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-surface-400" />
            Plan &amp; Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-surface-100 rounded-lg" />
        </CardContent>
      </Card>
    }>
      <SubscriptionCard profile={profile} />
    </Suspense>
  );
}

// ──────────────────────────────────────────────
// Company Details Card
// ──────────────────────────────────────────────

function CompanyDetailsCard({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(() => ({
    company_name: profile.company_name || "",
    phone: profile.phone || "",
    postcode: profile.postcode || "",
  }), [profile]);

  const initialTradeValues = useMemo(
    () => ({
      trade: profile.trade as Trade,
      customTradeName: profile.custom_trade_name || "",
    }),
    [profile],
  );

  const [formData, setFormData] = useState(initialValues);
  const [selectedTrade, setSelectedTrade] = useState<Trade>(initialTradeValues.trade);
  const [customTradeName, setCustomTradeName] = useState(initialTradeValues.customTradeName);

  const isFormDirty =
    formData.company_name !== initialValues.company_name ||
    formData.phone !== initialValues.phone ||
    formData.postcode !== initialValues.postcode;

  const isTradeDirty =
    selectedTrade !== initialTradeValues.trade ||
    customTradeName.trim() !== initialTradeValues.customTradeName.trim();

  const isTradeValid =
    selectedTrade !== "other" || customTradeName.trim().length > 0;

  const isDirty = isFormDirty || (isTradeDirty && isTradeValid);

  const handleUndo = useCallback(() => {
    setFormData(initialValues);
    setSelectedTrade(initialTradeValues.trade);
    setCustomTradeName(initialTradeValues.customTradeName);
  }, [initialValues, initialTradeValues]);

  const tradeConfig = TRADES_CONFIG.find((t) => t.value === selectedTrade);
  const tradeName =
    selectedTrade === "other"
      ? customTradeName || "Other"
      : tradeConfig?.label || selectedTrade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrade === "other" && !customTradeName.trim()) {
      setError("Please enter your trade name.");
      return;
    }
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
          trade: selectedTrade,
          custom_trade_name:
            selectedTrade === "other" ? customTradeName.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-surface-400" />
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
              autoComplete="organization"
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
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Business Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                placeholder="SW1A 1AA"
                autoComplete="postal-code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade">Trade</Label>
            <div className="space-y-2">
              <Select
                value={selectedTrade}
                onValueChange={(value) => setSelectedTrade(value as Trade)}
              >
                <SelectTrigger id="trade">
                  <SelectValue placeholder="Select your trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES_CONFIG.map((trade) => (
                    <SelectItem key={trade.value} value={trade.value}>
                      <span className="flex items-center gap-2">
                        <trade.icon className="h-4 w-4 text-brand-600" />
                        <span>{trade.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTrade === "other" && (
                <div className="space-y-1">
                  <Label
                    htmlFor="custom-trade"
                    className="text-xs text-surface-500"
                  >
                    Your trade name
                  </Label>
                  <Input
                    id="custom-trade"
                    value={customTradeName}
                    onChange={(e) => setCustomTradeName(e.target.value)}
                    placeholder="e.g. Solar Panel Installer"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-surface-500">
                {tradeConfig && (
                  <tradeConfig.icon className="h-3.5 w-3.5 text-brand-600" />
                )}
                <span>
                  {tradeName} — used on your quotes and customer-facing pages.
                </span>
              </div>
            </div>
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}
          <CardActions isLoading={isLoading} success={success} isDirty={isDirty} onUndo={handleUndo} />
        </CardContent>
      </Card>
    </form>
  );
}

// ──────────────────────────────────────────────
// Branding Card
// ──────────────────────────────────────────────

function BrandingCard({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialColor = profile.brand_color || "#22c55e";
  const [brandColor, setBrandColor] = useState(initialColor);
  const companyName = profile.company_name || "Your Company";
  const phone = profile.phone || "Phone number";

  const isDirty = brandColor !== initialColor;

  const handleUndo = useCallback(() => {
    setBrandColor(initialColor);
  }, [initialColor]);

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
          brand_color: brandColor,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-surface-400" />
            Brand Color
          </CardTitle>
          <CardDescription>
            Used on your quotes and customer-facing pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {BRAND_COLORS.map((color) => (
              <Button
                key={color.value}
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setBrandColor(color.value)}
                className={cn(
                  "h-9 w-9 rounded-lg border-2 transition-all hover:scale-105",
                  brandColor === color.value
                    ? "border-surface-900 scale-110 ring-2 ring-surface-900/20"
                    : "border-transparent"
                )}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>

          <div className="p-4 rounded-lg border border-surface-200 bg-surface-800">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3 text-surface-300">Preview</p>
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {companyName.charAt(0) || "Q"}
              </div>
              <div>
                <p className="font-semibold text-sm text-white">
                  {companyName}
                </p>
                <p className="text-xs text-surface-400">
                  {phone}
                </p>
              </div>
            </div>
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}
          <CardActions isLoading={isLoading} success={success} isDirty={isDirty} onUndo={handleUndo} />
        </CardContent>
      </Card>
    </form>
  );
}

// ──────────────────────────────────────────────
// Quote Defaults Card
// ──────────────────────────────────────────────

function QuoteDefaultsCard({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(() => ({
    expiryDays: profile.default_quote_expiry_days ?? 30,
    vatEnabled: profile.vat_enabled ?? true,
    vatRate: profile.default_vat_rate ?? 20,
  }), [profile]);

  const [expiryDays, setExpiryDays] = useState(initialValues.expiryDays);
  const [vatEnabled, setVatEnabled] = useState(initialValues.vatEnabled);
  const [vatRate, setVatRate] = useState(initialValues.vatRate);

  const isDirty = expiryDays !== initialValues.expiryDays ||
    vatEnabled !== initialValues.vatEnabled ||
    vatRate !== initialValues.vatRate;

  const handleUndo = useCallback(() => {
    setExpiryDays(initialValues.expiryDays);
    setVatEnabled(initialValues.vatEnabled);
    setVatRate(initialValues.vatRate);
  }, [initialValues]);

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
          default_quote_expiry_days: expiryDays,
          vat_enabled: vatEnabled,
          default_vat_rate: vatRate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-surface-400" />
            Quote Defaults
          </CardTitle>
          <CardDescription>
            Default values applied to new quotes — you can override per quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Expiry */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-surface-900">Quote validity</p>
              <p className="text-xs text-surface-500">How long quotes are valid for</p>
            </div>
            <Select
              value={String(expiryDays)}
              onValueChange={(value) => setExpiryDays(Number(value))}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="21">21 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="45">45 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-surface-100" />

          {/* VAT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-surface-400" />
                <div>
                  <p className="text-sm font-medium text-surface-900">VAT / Tax</p>
                  <p className="text-xs text-surface-500">Add VAT or sales tax to quotes</p>
                </div>
              </div>
              <Switch
                checked={vatEnabled}
                onCheckedChange={setVatEnabled}
              />
            </div>

            {vatEnabled && (
              <div className="flex items-center gap-3 ml-6 pl-2 border-l-2 border-surface-100">
                <Label htmlFor="vat-rate" className="text-sm text-surface-600 whitespace-nowrap">
                  Default rate
                </Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="vat-rate"
                    name="vatRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={vatRate}
                    onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-sm text-surface-500">%</span>
                </div>
              </div>
            )}
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}
          <CardActions isLoading={isLoading} success={success} isDirty={isDirty} onUndo={handleUndo} />
        </CardContent>
      </Card>
    </form>
  );
}

// ──────────────────────────────────────────────
// Automated Follow-ups Card
// ──────────────────────────────────────────────

function NotificationsCard({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues = useMemo(() => ({
    auto_followup_enabled: profile.auto_followup_enabled ?? true,
    auto_followup_days: profile.auto_followup_days ?? 3,
    expiry_reminder_enabled: profile.expiry_reminder_enabled ?? true,
    expiry_reminder_days: profile.expiry_reminder_days ?? 2,
  }), [profile]);

  const [formData, setFormData] = useState(initialValues);

  const isDirty = formData.auto_followup_enabled !== initialValues.auto_followup_enabled ||
    formData.auto_followup_days !== initialValues.auto_followup_days ||
    formData.expiry_reminder_enabled !== initialValues.expiry_reminder_enabled ||
    formData.expiry_reminder_days !== initialValues.expiry_reminder_days;

  const handleUndo = useCallback(() => {
    setFormData(initialValues);
  }, [initialValues]);

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
          auto_followup_enabled: formData.auto_followup_enabled,
          auto_followup_days: formData.auto_followup_days,
          expiry_reminder_enabled: formData.expiry_reminder_enabled,
          expiry_reminder_days: formData.expiry_reminder_days,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-surface-400" />
            Automated Follow-ups
          </CardTitle>
          <CardDescription>
            Automatically chase unviewed quotes and remind customers before expiry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Follow-up */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-surface-900">Follow-up emails</p>
                <p className="text-xs text-surface-500">
                  Remind customers about unviewed quotes
                </p>
              </div>
              <Switch
                checked={formData.auto_followup_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_followup_enabled: checked })}
              />
            </div>
            
            {formData.auto_followup_enabled && (
              <div className="flex items-center gap-3 ml-6 pl-2 border-l-2 border-surface-100">
                <Label htmlFor="auto-followup-days" className="text-sm text-surface-600 whitespace-nowrap">
                  Send after
                </Label>
                <Select
                  value={String(formData.auto_followup_days)}
                  onValueChange={(value) => setFormData({ ...formData, auto_followup_days: Number(value) })}
                >
                  <SelectTrigger id="auto-followup-days" className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-surface-500">Up to 3 emails, 3 days apart</p>
              </div>
            )}
          </div>

          <div className="border-t border-surface-100" />

          {/* Expiry reminder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-surface-900">Expiry reminders</p>
                <p className="text-xs text-surface-500">
                  Notify customers before their quote expires
                </p>
              </div>
              <Switch
                checked={formData.expiry_reminder_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, expiry_reminder_enabled: checked })}
              />
            </div>
            
            {formData.expiry_reminder_enabled && (
              <div className="flex items-center gap-3 ml-6 pl-2 border-l-2 border-surface-100">
                <Label htmlFor="expiry-reminder-days" className="text-sm text-surface-600 whitespace-nowrap">
                  Send
                </Label>
                <Select
                  value={String(formData.expiry_reminder_days)}
                  onValueChange={(value) => setFormData({ ...formData, expiry_reminder_days: Number(value) })}
                >
                  <SelectTrigger id="expiry-reminder-days" className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="2">2 days before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="5">5 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-surface-500">expiry</span>
              </div>
            )}
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}
          <CardActions isLoading={isLoading} success={success} isDirty={isDirty} onUndo={handleUndo} />
        </CardContent>
      </Card>
    </form>
  );
}

// ──────────────────────────────────────────────
// Change Password Card
// ──────────────────────────────────────────────

function ChangePasswordCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const isDirty = formData.newPassword.length > 0 || formData.confirmPassword.length > 0;

  const handleUndo = useCallback(() => {
    setFormData({ newPassword: "", confirmPassword: "" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setFormData({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-surface-400" />
            Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="hidden" name="username" autoComplete="username" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="At least 8 characters"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {error && <Alert variant="destructive">{error}</Alert>}
          {success && <Alert variant="success">Password updated successfully!</Alert>}
          <CardActions isLoading={isLoading} success={success} isDirty={isDirty} onUndo={handleUndo} />
        </CardContent>
      </Card>
    </form>
  );
}

// ──────────────────────────────────────────────
// Download my data (GDPR right of access)
// ──────────────────────────────────────────────

function DownloadDataCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `quoteflo-data-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Error already logged; user sees button reset
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4 text-surface-600" />
          Download my data
        </CardTitle>
        <CardDescription>
          Get a copy of your account data (profile, customers, quotes) in JSON format. This supports your right of access under UK GDPR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownload}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download my data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Delete Account Card
// ──────────────────────────────────────────────

function DeleteAccountCard({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const deletionScheduledAt = profile.deletion_scheduled_at
    ? new Date(profile.deletion_scheduled_at)
    : null;
  const deletionDateFormatted = deletionScheduledAt
    ? deletionScheduledAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleScheduleDeletion = async () => {
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule account deletion");
      }
      setOpen(false);
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    setIsCancelling(true);
    setError(null);
    try {
      const response = await fetch("/api/account/cancel-deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel deletion");
      }
      setCancelOpen(false);
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!isDeleting) {
      setOpen(next);
      if (!next) {
        setPassword("");
        setError(null);
      }
    }
  };

  const handleCancelOpenChange = (next: boolean) => {
    if (!isCancelling) {
      setCancelOpen(next);
      if (!next) {
        setPassword("");
        setError(null);
      }
    }
  };

  if (deletionScheduledAt) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-amber-600" />
            Account scheduled for deletion
          </CardTitle>
          <CardDescription>
            Your account and all data will be permanently deleted on{" "}
            <strong>{deletionDateFormatted}</strong>. If you did not request this (for example if
            someone else had access to your account), cancel the deletion below to keep your
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={cancelOpen} onOpenChange={handleCancelOpenChange}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                Cancel deletion
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel account deletion?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <span>Enter your password to cancel the scheduled deletion and keep your account.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4 space-y-2">
                <Label htmlFor="cancel-deletion-password">Your password</Label>
                <Input
                  id="cancel-deletion-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isCancelling}
                  className="mt-1"
                />
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    {error}
                  </Alert>
                )}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={isCancelling}>
                  Close
                </AlertDialogCancel>
                <AlertDialogAction
                  type="button"
                  disabled={isCancelling || !password.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    void handleCancelDeletion();
                  }}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling…
                    </>
                  ) : (
                    "Cancel deletion"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-500" />
          Delete account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data after a 30-day grace period.
          You can cancel the deletion anytime before the date. If someone else deleted your account
          without your consent, log in and cancel the deletion here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <span>
                  Your account will be scheduled for deletion in 30 days. Until then you can log in
                  and cancel. After 30 days, your account and all data will be permanently removed.
                  Enter your password to confirm.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="delete-account-password">Your password</Label>
              <Input
                id="delete-account-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isDeleting}
                className="mt-1"
              />
              {error && (
                <Alert variant="destructive" className="mt-2">
                  {error}
                </Alert>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                type="button"
                disabled={isDeleting || !password.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  void handleScheduleDeletion();
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scheduling…
                  </>
                ) : (
                  "Delete my account"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Section exports for split settings pages
// ──────────────────────────────────────────────

export function BusinessSettingsSection({ profile }: SettingsFormProps) {
  return (
    <section className="space-y-4">
      <CompanyDetailsCard profile={profile} />
      <BrandingCard profile={profile} />
    </section>
  );
}

export function QuotingSettingsSection({ profile }: SettingsFormProps) {
  return (
    <section className="space-y-4">
      <QuoteDefaultsCard profile={profile} />
      <NotificationsCard profile={profile} />
    </section>
  );
}

export function AccountSettingsSection({ profile }: SettingsFormProps) {
  return (
    <section className="space-y-4">
      <ChangePasswordCard />
      <SubscriptionCardWrapper profile={profile} />
      <DownloadDataCard />
      <DeleteAccountCard profile={profile} />
    </section>
  );
}

// ──────────────────────────────────────────────
// Main Settings Form (all sections, for backwards compatibility)
// ──────────────────────────────────────────────

export function SettingsForm({ profile }: SettingsFormProps) {
  return (
    <div className="space-y-10">
      <BusinessSettingsSection profile={profile} />
      <QuotingSettingsSection profile={profile} />
      <AccountSettingsSection profile={profile} />
    </div>
  );
}
