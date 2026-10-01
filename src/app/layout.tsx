import type { Metadata } from "next";
import { Playfair_Display, Poppins, PT_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["italic", "normal"], weight: ["400", "500"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const ptSerif = PT_Serif({ variable: "--font-pt-serif", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: "West Coast Hosting Co", template: "%s | West Coast Hosting Co" },
  description: "Short-term rental management and co-hosting from Hood Canal to Mount Rainier. Coast to Cascades.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${playfair.variable} ${poppins.variable} ${ptSerif.variable} h-full`}>
        <body className="min-h-full flex flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
