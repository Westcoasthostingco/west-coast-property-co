import type { Metadata } from "next";
import CoastToCascades from "@/components/art/CoastToCascades";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="caps text-xs text-sky">About us</p>
          <h1 className="display mt-2 text-5xl text-teal">Meet West Coast Hosting Co.</h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>We are Christi and Melissa, longtime friends and business partners, and the team behind every stay we host.</p>
            <p>Between us, we bring 22 years of combined experience across real estate, sales, and short-term rental management, all rooted here in the Puget Sound region.</p>
            <p>What started as two friends helping each other manage a few properties grew into something bigger: a business built on being genuinely reachable, responsive, and hands-on with every property we manage.</p>
            <p>From the shores of Hood Canal to the heart of downtown Gig Harbor to the foothills near Mount Rainier, we bring the same hands-on care to every property, every guest, and every owner we work with.</p>
          </div>
          <p className="display mt-10 text-3xl text-teal">Coast to Cascades, we have you covered.</p>
        </div>
        <CoastToCascades className="w-full rounded-3xl shadow-lg shadow-teal/10" />
      </section>
      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="caps text-xs text-sky">At a glance</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {["22 years combined experience in sales, real estate, and short-term rental management", "Five-star rated co-hosts", "Based in Gig Harbor, WA, managing properties from Hood Canal to Mount Rainier"].map((t) => (
              <li key={t} className="display text-2xl text-charcoal">{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
