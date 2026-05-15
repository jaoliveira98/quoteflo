import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors hidden sm:inline-flex"
              >
                Log in
              </Link>
              <Button asChild size="sm" className="sm:hidden">
                <Link href="/signup">Start Free</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-labelledby="hero-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6 sm:mb-8 border border-brand-100">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Built for UK Tradespeople
          </div>

          {/* Headline */}
          <h1 id="hero-heading" className="text-3xl sm:text-5xl lg:text-6xl font-bold text-surface-900 tracking-tight mb-5 sm:mb-6 leading-tight">
            Professional Quotes in{" "}
            <span className="text-brand-600 relative inline-block">
              Under 5 Minutes
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8C50 3 150 1 298 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-brand-300" />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-surface-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Stop wasting hours on Word and Excel. Create, send, and track professional 
            quotes from your phone. Built specifically for electricians, plumbers, and builders.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="text-base px-8 w-full sm:w-auto shadow-medium hover:shadow-strong transition-shadow">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 sm:mt-12">
            <div className="flex -space-x-2">
              {["JB", "SM", "DR", "KW", "PT"].map((initials, i) => (
                <div 
                  key={i}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-surface-200 to-surface-300 border-2 border-white flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-surface-600">{initials}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-surface-600">
                Loved by 500+ UK tradespeople
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-surface-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-surface-500">
              <Link href="/login" className="hover:text-surface-700 transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-surface-700 transition-colors">Sign up</Link>
              <Link href="/contact" className="hover:text-surface-700 transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-surface-700 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-surface-700 transition-colors">Privacy</Link>
              <Link href="/cookies" className="hover:text-surface-700 transition-colors">Cookies</Link>
            </div>
            <p className="text-sm text-surface-500">
              © {new Date().getFullYear()} QuoteFlo. Built for UK tradespeople.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
