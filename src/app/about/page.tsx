import type { Metadata } from "next";
import CoastToCascades from "@/components/art/CoastToCascades";
import JsonLd from "@/components/seo/JsonLd";
import { FOUNDERS, personJsonLd } from "@/lib/seo";

const description =
  "Meet Christi Young and Melissa Heckman, the Gig Harbor friends behind West Coast Hosting Co, a showcase of vacation homes from Hood Canal to Mount Rainier.";
export const metadata: Metadata = {
  title: "About Christi and Melissa",
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", url: "/about", title: "About | West Coast Hosting Co", description },
  twitter: { card: "summary_large_image", title: "About | West Coast Hosting Co", description },
};

export default function About() {
  return (
    <main>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": FOUNDERS.map(personJsonLd) }} />
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="caps text-xs text-deep">About us</p>
          <h1 className="display mt-2 text-5xl text-deep">Meet West Coast Hosting Co.</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>We are Christi and Melissa, longtime friends and business partners from Gig Harbor, with 22 years of combined experience in real estate and sales, all rooted here in the Puget Sound region.</p>
            <p>We built this site to show off three Washington homes the way a listing page can&apos;t: bigger photos, the neighborhood, the view, and what&apos;s worth doing nearby, from the shores of Hood Canal to the heart of downtown Gig Harbor to the foothills near Mount Rainier.</p>
            <p>When you find the one you want, each home&apos;s page takes you straight to its Airbnb or Vrbo listing, where you see live prices and book with the host.</p>
          </div>
          <p className="display mt-10 text-3xl text-deep">Coast to Cascades.</p>
        </div>
        <CoastToCascades className="w-full rounded-3xl shadow-lg shadow-teal/10" />
      </section>
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="caps text-xs text-deep">At a glance</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {["Three homes, from Hood Canal to Mount Rainier", "Based in Gig Harbor, Washington", "Booked on Airbnb and Vrbo"].map((t) => (
              <li key={t} className="display text-2xl text-charcoal">{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
