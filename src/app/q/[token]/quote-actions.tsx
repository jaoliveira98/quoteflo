"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, X, Loader2 } from "lucide-react";

interface QuoteActionsProps {
  quoteId: string;
  token: string;
  brandColor?: string;
}

export function QuoteActions({ quoteId, token, brandColor = "#22c55e" }: QuoteActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsLoading("accept");
    setError(null);

    try {
      const res = await fetch("/api/quotes/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quote_id: quoteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to accept");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDecline = async () => {
    setIsLoading("decline");
    setError(null);

    try {
      const res = await fetch("/api/quotes/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quote_id: quoteId }),
      });

      if (!res.ok) {
        throw new Error("Failed to decline");
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const borderColor = `${brandColor}33`;
  const bgColor = `${brandColor}0d`;

  return (
    <Card style={{ borderColor, backgroundColor: bgColor }}>
      <CardContent className="p-6">
        <h3 className="font-semibold text-surface-900 mb-2 text-center">
          Ready to proceed?
        </h3>
        <p className="text-surface-600 text-center mb-6">
          Accept this quote to confirm the work
        </p>

        {error && (
          <Alert variant="destructive" className="mb-4">{error}</Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAccept}
            disabled={isLoading !== null}
            className="flex-1"
            size="lg"
            style={{ backgroundColor: brandColor, borderColor: brandColor }}
          >
            {isLoading === "accept" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Accept Quote
          </Button>
          <Button
            onClick={handleDecline}
            disabled={isLoading !== null}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            {isLoading === "decline" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Decline
          </Button>
        </div>

        <p className="text-xs text-surface-500 text-center mt-4">
          By accepting, you agree to proceed with the quoted work at the stated price.
        </p>
      </CardContent>
    </Card>
  );
}
