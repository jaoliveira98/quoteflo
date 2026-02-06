import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
