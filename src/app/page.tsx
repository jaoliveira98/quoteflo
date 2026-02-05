import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Star
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-surface-600 hover:text-surface-900"
              >
                Log in
              </Link>
              <Button asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Built for UK Tradespeople
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 tracking-tight mb-6">
            Professional Quotes in{" "}
            <span className="text-brand-600">Under 5 Minutes</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto mb-10">
            Stop wasting hours on Word and Excel. Create, send, and track professional 
            quotes from your phone. Built specifically for electricians, plumbers, and builders.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/signup">
                Start 14-Day Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-surface-500">
              No credit card required
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 mt-12">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="h-10 w-10 rounded-full bg-surface-200 border-2 border-white"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 ml-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm text-surface-600 ml-2">
              Loved by 500+ UK tradespeople
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">
              Why Tradespeople Love QuoteFlo
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Everything you need to create winning quotes, nothing you don&apos;t.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">
                5-Minute Quotes
              </h3>
              <p className="text-surface-600">
                Pre-loaded service library with smart pricing. Pick from the list, 
                adjust quantities, and send. No more typing the same things over and over.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-6">
                <Smartphone className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">
                Mobile-First
              </h3>
              <p className="text-surface-600">
                Create and send quotes right from site. No need to wait until you&apos;re 
                back at the office. Quote while the job is fresh in your mind.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft">
              <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">
                UK Compliant
              </h3>
              <p className="text-surface-600">
                Proper VAT handling, CIS support, and UK consumer rights built-in. 
                Part P and Gas Safe compliance notes included automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-surface-900 mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-lg text-surface-600 mb-10">
            Just £29/month for unlimited quotes. That&apos;s less than £1/day to save 20+ hours/month.
          </p>
          
          <div className="bg-surface-50 rounded-2xl p-8 sm:p-12">
            <div className="text-5xl font-bold text-surface-900 mb-2">
              £29<span className="text-xl font-normal text-surface-500">/month</span>
            </div>
            <p className="text-surface-600 mb-8">
              or £290/year (save 2 months)
            </p>
            
            <ul className="text-left max-w-sm mx-auto space-y-3 mb-8">
              {[
                "Unlimited quotes",
                "All trade templates",
                "Auto follow-ups",
                "Smart pricing suggestions",
                "Custom branding",
                "Quote analytics"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-surface-700">
                  <CheckCircle2 className="h-5 w-5 text-brand-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Start 14-Day Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-surface-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-surface-500">
              © {new Date().getFullYear()} QuoteFlo. Built for UK tradespeople.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
