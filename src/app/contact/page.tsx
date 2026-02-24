import Link from "next/link";
import { Logo } from "@/components/logo";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Contact QuoteFlo support.",
};

const SUPPORT_EMAIL = "support@quoteflo.com";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-surface-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center bg-brand-100 text-brand-600 mb-6">
          <Mail className="h-7 w-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
          Get in touch
        </h1>
        <p className="text-surface-600 mb-8 max-w-md mx-auto">
          For support, billing questions, or privacy requests, email us and we&apos;ll get back to you as soon as we can.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
        >
          <Mail className="h-4 w-4" />
          {SUPPORT_EMAIL}
        </a>
        <p className="mt-12 text-sm text-surface-500">
          <Link href="/" className="underline hover:text-surface-700">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
