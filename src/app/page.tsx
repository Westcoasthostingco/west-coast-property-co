import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/lib/data";

export default async function Home() {
  const properties = await getProperties();
  return (
    <main>
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Coastal stays, managed with care.
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Book a hand-picked vacation rental along the California coast, or let us manage your property end to end.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/properties" className="rounded-full bg-accent px-6 py-2.5 font-medium text-white">Browse stays</Link>
            <Link href="/services" className="rounded-full border border-white/40 px-6 py-2.5">Owner services</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-6 text-2xl font-semibold">Featured properties</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>
    </main>
  );
}
