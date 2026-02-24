import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Clock, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight,
  Star,
  FileText,
  Send,
  BarChart3,
  Bell,
  Shield,
  Quote
} from "lucide-react";

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

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6 sm:mb-8 border border-brand-100">
            <Zap className="h-3.5 w-3.5" />
            Built for UK Tradespeople
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-surface-900 tracking-tight mb-5 sm:mb-6 leading-tight">
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

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-50 border-y border-surface-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
              Quote to Cash in 3 Steps
            </h2>
            <p className="text-base sm:text-lg text-surface-600">
              Getting paid shouldn&apos;t be the hardest part of the job.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-surface-200" />
            
            {[
              {
                step: "1",
                icon: FileText,
                title: "Pick Your Services",
                description: "Select from your pre-loaded trade library. Adjust quantities and pricing. Done in 2 minutes.",
              },
              {
                step: "2",
                icon: Send,
                title: "Send Instantly",
                description: "One tap to email a professional PDF. Your customer gets a clean, branded quote link.",
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "Get Accepted",
                description: "Customers accept with one click. You get notified instantly. Auto follow-ups chase the rest.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative z-10 inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-5 shadow-soft bg-white border border-surface-200">
                  <item.icon className="h-6 w-6 text-brand-600" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-surface-900 text-white text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-surface-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
              Why Tradespeople Love QuoteFlo
            </h2>
            <p className="text-base sm:text-lg text-surface-600 max-w-2xl mx-auto">
              Everything you need to create winning quotes, nothing you don&apos;t.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: Clock,
                title: "5-Minute Quotes",
                description: "Pre-loaded service library with smart pricing. Pick, adjust, send. No more retyping the same descriptions.",
                highlight: true,
              },
              {
                icon: Smartphone,
                title: "Mobile-First",
                description: "Create and send quotes right from site. Quote while the job is fresh in your mind.",
              },
              {
                icon: Shield,
                title: "UK Compliant",
                description: "Proper VAT handling, Part P & Gas Safe notes, UK consumer rights. Built-in compliance.",
              },
              {
                icon: Bell,
                title: "Auto Follow-ups",
                description: "Automatic reminders chase quotes you've sent. No more forgotten follow-ups costing you jobs.",
              },
              {
                icon: BarChart3,
                title: "Win Rate Analytics",
                description: "See your conversion rate, average quote value, and which jobs win most.",
              },
              {
                icon: FileText,
                title: "Professional PDFs",
                description: "Branded quotes your customers actually respect. Stand out from handwritten estimates.",
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className={`rounded-2xl p-6 sm:p-7 transition-all ${
                  feature.highlight 
                    ? "bg-brand-50 border-2 border-brand-200 shadow-soft" 
                    : "bg-white border border-surface-200 hover:border-surface-300 hover:shadow-soft"
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${
                  feature.highlight ? "bg-brand-600" : "bg-surface-100"
                }`}>
                  <feature.icon className={`h-5 w-5 ${feature.highlight ? "text-white" : "text-surface-600"}`} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-50 border-y border-surface-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
              Hear From Other Trades
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                quote: "Used to spend Sunday evenings doing quotes. Now I fire them off from the van between jobs. Game changer.",
                name: "James B.",
                role: "Electrician, Manchester",
                initials: "JB",
              },
              {
                quote: "My acceptance rate went up 30% just from the professional look of the quotes. Customers take you more seriously.",
                name: "Sarah M.",
                role: "Plumber, Bristol",
                initials: "SM",
              },
              {
                quote: "The auto follow-ups alone paid for itself. I was losing jobs because I'd forget to chase people.",
                name: "Dave R.",
                role: "Builder, Leeds",
                initials: "DR",
              },
            ].map((testimonial) => (
              <div 
                key={testimonial.name}
                className="bg-white rounded-2xl p-6 border border-surface-200 flex flex-col"
              >
                <Quote className="h-8 w-8 text-brand-200 mb-3 flex-shrink-0" />
                <p className="text-surface-700 text-sm leading-relaxed flex-1 mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-surface-100">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-brand-700">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">{testimonial.name}</p>
                    <p className="text-xs text-surface-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">
            Simple, Honest Pricing
          </h2>
          <p className="text-base sm:text-lg text-surface-600 mb-8 sm:mb-10">
            Just £29/month for unlimited quotes. That&apos;s less than £1/day.
          </p>
          
          <div className="bg-white rounded-2xl border-2 border-surface-200 overflow-hidden shadow-soft">
            <div className="p-8 sm:p-10 pb-0">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-5xl font-bold text-surface-900">£29</span>
                <span className="text-lg text-surface-500">/month</span>
              </div>
              <p className="text-sm text-surface-500 mb-8">
                or £290/year (save 2 months)
              </p>
              
              <ul className="text-left space-y-3 mb-8">
                {[
                  "Unlimited quotes",
                  "All trade service templates",
                  "Automatic follow-ups & reminders",
                  "Smart pricing suggestions",
                  "Custom branding & logo",
                  "Quote analytics & insights",
                  "Professional PDF generation",
                  "Email delivery & tracking"
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-surface-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8 bg-surface-50 border-t border-surface-200">
              <Button asChild size="lg" className="w-full shadow-medium">
                <Link href="/signup">
                  Start 14-Day Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-surface-500 mt-3">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-surface-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Win More Jobs?
          </h2>
          <p className="text-surface-300 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Join 500+ UK tradespeople who&apos;ve ditched the spreadsheets. 
            Your first quote is 5 minutes away.
          </p>
          <Button asChild size="lg" className="text-base px-8 shadow-strong">
            <Link href="/signup">
              Start Free — No Card Needed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
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
