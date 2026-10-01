import Link from "next/link";

export default function BookingCancelled() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Booking not completed</h1>
      <p className="mt-3 text-muted">No charge was made. Your dates are held for 30 minutes if you want to try again.</p>
      <Link href="/properties" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-white">Back to properties</Link>
    </main>
  );
}
