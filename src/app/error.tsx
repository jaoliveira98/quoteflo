"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 rounded-2xl items-center justify-center bg-red-100 text-red-600 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-surface-600 mb-8">
          We encountered an error. You can try again or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
