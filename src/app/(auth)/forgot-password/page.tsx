"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/reset-password`
        : "/reset-password";
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-medium">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-brand-600" />
          </div>
          <h2 className="text-xl font-semibold text-surface-900 mb-2">Check your email</h2>
          <p className="text-surface-600 mb-6">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-surface-500 mb-6">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Button 
              variant="link"
              className="p-0 h-auto text-brand-600"
              onClick={() => setIsSuccess(false)}
            >
              try again
            </Button>
          </p>
          <Button asChild variant="outline">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader className="text-center pb-2">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">Forgot password?</h1>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <Alert variant="destructive" aria-live="polite" role="alert">{error}</Alert>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <div className="pt-2 text-center">
            <Link 
              href="/login" 
              className="text-sm text-surface-600 hover:text-surface-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
