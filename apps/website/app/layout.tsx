import type { Metadata } from "next";

import "@/app/globals.css";

import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { CookieBanner } from "@/components/privacy/cookie-banner";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Psychology and Research`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <div className="absolute inset-0 -z-10 bg-grid [background-size:20px_20px] opacity-[0.35]" />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
            <CookieBanner />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
