import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Privacy Policy",
  description: "QuoteFlo privacy policy, data collection, and your rights under UK GDPR.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-surface-500 text-sm mb-10">
          Last updated: February 2025
        </p>

        <article className="prose prose-headings:text-surface-900 prose-p:text-surface-700 prose-li:text-surface-700 max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              1. Data controller
            </h2>
            <p>
              The data controller responsible for your personal data is QuoteFlo. For privacy-related enquiries you may contact us at the support or contact address published on our website (e.g. support@quoteflo.com or via the Contact page). If trading as a UK entity, our company name and registered address will be stated in the footer of our website and/or in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              2. What data we collect
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> email address, company name, trade (e.g. electrician, plumber), password (hashed), and profile preferences (e.g. branding, notification settings).</li>
              <li><strong>Customer data:</strong> names, email addresses, phone numbers, and addresses of customers you add for the purpose of sending quotes.</li>
              <li><strong>Quotes and usage:</strong> quote content, line items, amounts, status (sent, viewed, accepted/declined), and related usage data (e.g. when quotes were sent or viewed).</li>
              <li><strong>Billing:</strong> payment and subscription information is processed by Stripe; we store Stripe customer and subscription identifiers and status, not full card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              3. Legal basis for processing
            </h2>
            <p>
              We process your data on the following bases: <strong>contract</strong> (to provide the service you subscribed to), <strong>consent</strong> where we have asked for it (e.g. marketing emails if applicable), and <strong>legitimate interest</strong> where necessary for security, fraud prevention, and improving our service (e.g. logs, analytics). Where we rely on legitimate interest, we balance it against your rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              4. How long we keep data and account deletion
            </h2>
            <p>
              We retain your data for as long as your account is active. When you request account deletion, we schedule permanent deletion after a <strong>30-day grace period</strong>. During that period you may cancel the deletion. After the grace period, your account data, customer data, quotes, and related usage data are permanently deleted from our systems and from our processors (e.g. Supabase). Some backup or log data may be retained for a short period for operational or legal reasons, after which it is deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              5. Who we share data with
            </h2>
            <p>
              We use the following processors and services. Each is bound by contract (and where applicable, standard contractual clauses or equivalent safeguards) to protect your data:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> — hosting our database and authentication.</li>
              <li><strong>Stripe</strong> — payment and subscription processing.</li>
              <li><strong>Resend</strong> — transactional email (e.g. quote emails, reminders).</li>
              <li><strong>Vercel</strong> (or our hosting provider) — application hosting and serverless functions.</li>
            </ul>
            <p className="mt-2">
              We do not sell your personal data. We may disclose data if required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              6. International transfers
            </h2>
            <p>
              Some of our providers (e.g. in the US) may process data outside the UK/EEA. Where we do so, we ensure appropriate safeguards are in place, such as UK adequacy decisions, standard contractual clauses (SCCs), or equivalent mechanisms. Details can be provided on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              7. Your rights (UK GDPR / GDPR)
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access</strong> — request a copy of your personal data (you can also use &quot;Download my data&quot; in Settings where available).</li>
              <li><strong>Rectification</strong> — have inaccurate data corrected.</li>
              <li><strong>Erasure</strong> — request deletion (e.g. via &quot;Delete my account&quot; and the 30-day scheduled deletion).</li>
              <li><strong>Restriction</strong> — limit how we process your data in certain circumstances.</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
              <li><strong>Object</strong> — object to processing based on legitimate interest.</li>
              <li><strong>Complain</strong> — lodge a complaint with the ICO (ico.org.uk) or your supervisory authority.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us using the details in section 1. We will respond within one month.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              8. Cookies
            </h2>
            <p>
              We use cookies and similar technologies as described in our{" "}
              <Link href="/cookies" className="underline hover:text-surface-900">
                Cookie policy
              </Link>
              . We use strictly necessary cookies for authentication and session management (e.g. Supabase auth). If we introduce non-essential cookies (e.g. analytics or marketing), we will obtain your consent via a cookie banner and list them in the cookie policy.
            </p>
          </section>
        </article>

        <p className="mt-12 text-sm text-surface-500">
          <Link href="/" className="underline hover:text-surface-700">
            Back to home
          </Link>
          {" · "}
          <Link href="/terms" className="underline hover:text-surface-700">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/cookies" className="underline hover:text-surface-700">
            Cookie policy
          </Link>
        </p>
      </main>
    </div>
  );
}
