import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#22c55e",
};

export const metadata: Metadata = {
  title: "QuoteFlo - Professional Quotes in 5 Minutes",
  description: "The quote tool built for UK tradespeople. Create professional quotes from your phone in under 5 minutes. Electricians, plumbers, and builders love QuoteFlo.",
  keywords: ["quote software", "UK trades", "electrician quotes", "plumber quotes", "builder quotes", "trade quoting app", "invoice software UK"],
  authors: [{ name: "QuoteFlo" }],
  metadataBase: new URL("https://quoteflo.vercel.app"),
  openGraph: {
    title: "QuoteFlo - Professional Quotes in 5 Minutes",
    description: "Create professional quotes from your phone in under 5 minutes. Built for UK tradespeople.",
    type: "website",
    locale: "en_GB",
    siteName: "QuoteFlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuoteFlo - Professional Quotes in 5 Minutes",
    description: "Create professional quotes from your phone in under 5 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-4 focus:left-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-surface-900 focus:ring-2 focus:ring-brand-500"
        >
          Skip to content
        </a>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
