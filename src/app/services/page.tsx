import type { Metadata } from "next";

export const metadata: Metadata = { title: "Owner services" };

const services = [
  ["Listing and pricing", "Professional listings on Airbnb, Vrbo, Booking.com and our direct site, with dynamic pricing."],
  ["Guest communication", "Fast replies, automated check-in details, door codes and arrival reminders."],
  ["Cleaning and maintenance", "Scheduled turnovers, inspections and repairs coordinated for you."],
  ["Transparent payouts", "Guest payments go to your own bank account after check-in, with a statement for every booking."],
];

export default function Services() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Owner services</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {services.map(([t, d]) => (
          <div key={t} className="rounded-xl border border-line bg-white p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
