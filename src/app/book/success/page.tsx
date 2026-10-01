import Link from "next/link";

export default function BookingSuccess() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">You&apos;re booked</h1>
      <p className="mt-3 text-muted">A confirmation is on its way to your email. Check-in details and door codes arrive a few days before your stay.</p>
      <Link href="/properties" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-white">Back to properties</Link>
    </main>
  );
}
