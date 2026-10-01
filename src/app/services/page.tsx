import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

const description =
  "Short-term rental management and co-hosting in Gig Harbor, Hood Canal, and Mount Rainier: listing, pricing, guest messaging, cleaning, and owner statements.";
export const metadata: Metadata = {
  title: "For owners: short-term rental management & co-hosting",
  description,
  alternates: { canonical: "/services" },
  openGraph: { type: "website", url: "/services", title: "For owners | West Coast Hosting Co", description },
  twitter: { card: "summary_large_image", title: "For owners | West Coast Hosting Co", description },
};

const services = [
  ["Listing and pricing", "Professional listings on Airbnb, Vrbo, and our own site, with pricing tuned to the season and the region."],
  ["Guest communication", "Fast, personal replies. Check-in details, local tips, and arrival reminders from a real host."],
  ["Cleaning and turnovers", "Scheduled cleaners, inspections after every stay, and small fixes handled before they become big ones."],
  ["Transparent statements", "Guest payments go to your own bank account after check-in. Every booking shows up on a monthly statement, fee included."],
  ["Owner portal", "See occupancy, revenue trends, upcoming stays, and statements any time, from your phone."],
  ["Co-hosting", "Already listed? We can co-host on your existing accounts and take the day-to-day off your plate."],
];

export default function Services() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="For homeowners" title="What we handle" intro="You keep the keys and the view. We handle everything that makes a stay five stars." />
      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {services.map(([t, d]) => (
          <div key={t} className="bg-white p-8">
            <h2 className="display text-2xl text-deep">{t}</h2>
            <p className="mt-3 leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 rounded-3xl bg-mist p-10 text-center">
        <p className="caps text-xs text-deep">Fees</p>
        <p className="display mt-2 text-3xl text-charcoal">A simple percentage of nightly revenue. No setup fees.</p>
        <p className="mt-3 text-muted">Cleaning fees and lodging taxes pass through to guests. Let&apos;s talk about your home.</p>
        <Link href="/contact" className="caps-tight mt-6 inline-block rounded-full bg-deep px-6 py-3 text-[0.7rem] text-white hover:bg-dusk">Get in touch</Link>
      </div>
    </main>
  );
}
