import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "You're booked", robots: { index: false } };

export default function BookingSuccess() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="caps text-xs text-deep">Confirmed</p>
      <h1 className="display mt-2 text-5xl text-charcoal">You&apos;re booked.</h1>
      <p className="mt-4 text-lg text-muted">Your receipt and confirmation are on their way by email from hello@westcoasthostingco.com.</p>
      <ol className="ui mx-auto mt-10 max-w-md space-y-4 text-left text-sm">
        {[
          ["Today", "Check your inbox for the confirmation. Reply to it any time; it reaches Christi and Melissa directly."],
          ["A few days before", "Door code, parking, Wi-Fi and our favourite local spots arrive by email."],
          ["Check-in day", "Arrive any time after 4:00 pm. Check-out is 11:00 am."],
        ].map(([t, d]) => (
          <li key={t} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
            <span className="caps-tight shrink-0 pt-0.5 text-[0.6rem] text-deep">{t}</span><span className="text-charcoal">{d}</span>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/properties" className="caps-tight rounded-full bg-deep px-6 py-3 text-[0.7rem] text-white hover:bg-dusk">Back to the homes</Link>
        <Link href="/legal/policies#cancellation" className="caps-tight rounded-full border border-deep px-6 py-3 text-[0.7rem] text-deep hover:bg-deep hover:text-white">Cancellation policy</Link>
      </div>
    </main>
  );
}
