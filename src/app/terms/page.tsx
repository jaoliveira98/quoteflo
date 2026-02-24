import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "Terms of Service",
  description: "QuoteFlo terms of service, subscription, and acceptable use.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-surface-500 text-sm mb-10">
          Last updated: February 2025
        </p>

        <article className="prose prose-slate max-w-none space-y-8 text-surface-700">
          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              1. Description of the service and acceptable use
            </h2>
            <p>
              QuoteFlo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a software service that enables users to create, send, and manage professional quotes, primarily aimed at tradespeople in the United Kingdom. By using QuoteFlo you agree to use the service only for lawful purposes and in accordance with these terms. You must not use the service to send spam, harass others, or violate any applicable laws. You are responsible for the accuracy of the information you enter and for any quotes or communications you send through the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              2. Subscription, billing, and cancellation
            </h2>
            <p>
              QuoteFlo is offered on a subscription basis. We offer a <strong>14-day free trial</strong> with no payment required at signup. After the trial, subscription is billed monthly in GBP (e.g. as displayed on our pricing page) via Stripe. Payment is due at the start of each billing period. You may cancel your subscription at any time via the Stripe Customer Portal (accessible from your account settings). Upon cancellation, you retain access until the end of the current billing period; no further charges will be made. We do not offer refunds for partial months. Price changes will be communicated in advance and will apply from the next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              3. Account termination and scheduled deletion
            </h2>
            <p>
              You may request deletion of your account at any time from your account settings. Account deletion is scheduled with a <strong>30-day grace period</strong>. During this period you may log in and cancel the deletion to keep your account. After 30 days, your account and all associated data (profile, customers, quotes, usage data) are permanently deleted from our systems and cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              4. Limitation of liability and disclaimer of warranties
            </h2>
            <p>
              The service is provided &quot;as is&quot; and &quot;as available&quot;. We do not warrant that the service will be uninterrupted, error-free, or free of harmful components. To the fullest extent permitted by law, we exclude all warranties (express or implied). Our total liability to you for any claims arising from or related to the service shall not exceed the amount you paid us in the twelve months preceding the claim. We are not liable for any indirect, incidental, special, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              5. Governing law
            </h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              6. Changes to the terms
            </h2>
            <p>
              We may update these terms from time to time. We will notify you of material changes by posting the updated terms on this page and updating the &quot;Last updated&quot; date, and where appropriate by email or in-app notice. Continued use of the service after changes constitutes acceptance of the revised terms. If you do not agree, you should stop using the service and cancel your subscription.
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
        </p>
      </main>
    </div>
  );
}
