import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 rounded-2xl items-center justify-center bg-surface-200 text-surface-500 mb-6">
          <FileQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Page not found
        </h1>
        <p className="text-surface-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
