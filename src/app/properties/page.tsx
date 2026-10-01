import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/lib/data";

export const metadata: Metadata = { title: "Stay with us" };

export default async function Properties() {
  const properties = await getProperties();
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Our properties</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </main>
  );
}
