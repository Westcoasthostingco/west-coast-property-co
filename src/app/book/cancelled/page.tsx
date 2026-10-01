import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Booking not completed", robots: { index: false } };

export default function BookingCancelled() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="caps text-xs text-deep">No charge made</p>
      <h1 className="display mt-2 text-5xl text-charcoal">Booking not completed.</h1>
      <p className="mt-4 text-lg text-muted">Nothing was charged. Your dates stay held for 30 minutes if you want to try again, or email hello@westcoasthostingco.com and we&apos;ll help.</p>
      <Link href="/properties" className="caps-tight mt-8 inline-block rounded-full bg-deep px-6 py-3 text-[0.7rem] text-white hover:bg-dusk">Back to properties</Link>
    </main>
  );
}
