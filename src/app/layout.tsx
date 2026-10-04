import type { Metadata } from "next";
import { Playfair_Display, Poppins, PT_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { clerkConfigured } from "@/lib/auth";
import JsonLd from "@/components/seo/JsonLd";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, TAGLINE, organizationJsonLd } from "@/lib/seo";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["italic", "normal"], weight: ["400", "500"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const ptSerif = PT_Serif({ variable: "--font-pt-serif", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });

// Canonical and og:url are set per page (alternates is replaced, not merged, by
// child metadata, so a root canonical would mislabel every page without one).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", title: `${SITE_NAME} | ${TAGLINE}`, description: DEFAULT_DESCRIPTION },
  twitter: { card: "summary_large_image", title: `${SITE_NAME} | ${TAGLINE}`, description: DEFAULT_DESCRIPTION },
  robots: { index: true, follow: true },
  // Ownership tags for Google Search Console and Bing Webmaster Tools (HTML tag
  // method). Paste just the content value into Vercel; unset means no tag.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const Provider = clerkConfigured ? ClerkProvider : Passthrough;
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${ptSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Provider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Provider>
        <Analytics />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
