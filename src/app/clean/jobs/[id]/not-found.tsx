import Link from "next/link";

export default function JobNotFound() {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 text-center">
      <p className="caps-tight text-xs text-sky">Hmm</p>
      <h1 className="display mt-2 text-3xl">We can&apos;t find that job</h1>
      <p className="mt-3 text-lg text-muted">It may have been reassigned or removed. If that seems wrong, text Christi or Melissa.</p>
      <Link href="/clean" className="ui mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-teal px-6 text-base font-medium text-white hover:bg-teal-dark">Back to my jobs</Link>
    </section>
  );
}
