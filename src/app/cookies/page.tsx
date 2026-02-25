import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Cookie Policy",
  description: "QuoteFlo cookie policy: what cookies we use and why.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-surface-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-2">
          Cookie Policy
        </h1>
        <p className="text-surface-500 text-sm mb-10">
          Last updated: February 2025
        </p>

        <article className="prose prose-headings:text-surface-900 prose-p:text-surface-700 prose-li:text-surface-700 max-w-none space-y-8">
          <section>
            <p>
              This policy describes how QuoteFlo uses cookies and similar technologies. We aim to comply with UK GDPR and ePrivacy requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              Strictly necessary cookies
            </h2>
            <p>
              These cookies are essential for the service to function. We do not need your consent to use them. They are used for:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Authentication and session</strong> — Keeping you logged in and securing your session (e.g. Supabase auth cookies). Without these, you could not use the dashboard or send quotes.</li>
              <li><strong>Security</strong> — Helping protect against cross-site request forgery (CSRF) and abuse.</li>
            </ul>
            <p className="mt-2">
              Typical duration: session or short-lived (e.g. until you close the browser or a few days for “remember me” type functionality). We do not use strictly necessary cookies for tracking or advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              Non-essential cookies
            </h2>
            <p>
              We currently do not use non-essential cookies (e.g. analytics, marketing, or third-party advertising). If we introduce them in the future, we will:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Show a cookie consent banner on first visit.</li>
              <li>Obtain your consent before setting non-essential cookies.</li>
              <li>Update this policy with the name, purpose, duration, and provider of each cookie.</li>
              <li>Allow you to accept or reject non-essential cookies (or granular choices where required).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              How to control cookies
            </h2>
            <p>
              You can control or delete cookies via your browser settings. Blocking strictly necessary cookies will prevent you from using the logged-in areas of QuoteFlo. For more on your privacy rights, see our{" "}
              <Link href="/privacy" className="underline hover:text-surface-900">
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </article>

        <p className="mt-12 text-sm text-surface-500">
          <Link href="/" className="underline hover:text-surface-700">
            Back to home
          </Link>
          {" · "}
          <Link href="/privacy" className="underline hover:text-surface-700">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-surface-700">
            Terms of Service
          </Link>
        </p>
      </main>
    </div>
  );
}
