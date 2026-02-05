import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "QuoteFlo - Professional Quotes in 5 Minutes",
  description: "The quote tool built for UK tradespeople. Create professional quotes from your phone in under 5 minutes.",
  keywords: ["quote software", "UK trades", "electrician quotes", "plumber quotes", "builder quotes"],
  authors: [{ name: "QuoteFlo" }],
  openGraph: {
    title: "QuoteFlo - Professional Quotes in 5 Minutes",
    description: "Create professional quotes from your phone in under 5 minutes.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
