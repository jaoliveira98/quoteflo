"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TRADES_CONFIG } from "@/lib/constants";
import type { Trade } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
  });

  const handleTradeSelect = (trade: Trade) => {
    setSelectedTrade(trade);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrade) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            trade: selectedTrade,
            company_name: formData.companyName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && !data.session) {
        setError("Please check your email to confirm your account, then log in.");
        return;
      }

      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: data.user.id,
            email: formData.email,
            trade: selectedTrade,
            company_name: formData.companyName,
          }, { 
            onConflict: "id" 
          });
        
        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
        
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          {step === 1 
            ? "First, tell us what trade you're in"
            : "Now, let's set up your account"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <div className="space-y-3">
            {TRADES_CONFIG.map((trade) => (
              <Button
                key={trade.value}
                variant="outline"
                onClick={() => handleTradeSelect(trade.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 h-auto rounded-xl border-2 transition-all text-left justify-start",
                  "hover:border-brand-300 hover:bg-brand-50",
                  selectedTrade === trade.value
                    ? "border-brand-500 bg-brand-50 hover:bg-brand-50"
                    : "border-surface-200"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  selectedTrade === trade.value ? "bg-brand-500" : "bg-surface-100"
                )}>
                  <trade.icon className={cn(
                    "h-6 w-6",
                    selectedTrade === trade.value ? "text-white" : "text-surface-600"
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-surface-900">{trade.label}</p>
                  <p className="text-sm text-surface-500 font-normal">{trade.description}</p>
                </div>
              </Button>
            ))}

            <div className="pt-4 text-center text-sm text-surface-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-600 hover:underline font-medium">
                Log in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-50 text-brand-700 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Signing up as: <strong className="capitalize">{selectedTrade}</strong>
              </span>
              <Button 
                type="button"
                variant="link"
                className="ml-auto p-0 h-auto text-brand-600"
                onClick={() => setStep(1)}
              >
                Change
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Trading Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="e.g. Smith Electrical Services"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={8}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">{error}</Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Start 14-Day Free Trial"
              )}
            </Button>

            <p className="text-xs text-center text-surface-500">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </p>

            <div className="pt-2 text-center text-sm text-surface-500">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-600 hover:underline font-medium">
                Log in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
