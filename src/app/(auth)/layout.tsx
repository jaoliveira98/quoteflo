import { Logo } from "@/components/logo";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:flex-row">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-surface-900 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold text-white text-lg shadow-soft">
                Q
              </div>
              <span className="text-xl font-semibold tracking-tight">
                <span className="text-white">Quote</span>
                <span className="text-brand-400">Flo</span>
              </span>
            </div>
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
            Professional quotes<br />
            in under 5 minutes
          </h2>
          <div className="space-y-3">
            {[
              "Pre-loaded trade service library",
              "Professional branded PDFs",
              "Automatic follow-up reminders",
              "Full analytics dashboard",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-400 flex-shrink-0" />
                <span className="text-surface-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} QuoteFlo. Built for UK tradespeople.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="p-4 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Mobile footer */}
        <footer className="p-4 text-center text-sm text-surface-500 lg:hidden">
          © {new Date().getFullYear()} QuoteFlo. Built for UK tradespeople.
        </footer>
      </div>
    </div>
  );
}
