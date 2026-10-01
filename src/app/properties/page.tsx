import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { getProperties, getUnavailableDates } from "@/lib/data";

export const metadata: Metadata = { title: "Our homes" };

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Properties({ searchParams }: PageProps<"/properties">) {
  const sp = await searchParams;
  const region = str(sp.region), checkIn = str(sp.check_in), checkOut = str(sp.check_out);
  const guests = Number(str(sp.guests)) || 0;

  let list = await getProperties();
  if (region) list = list.filter((p) => p.city === region);
  if (guests) list = list.filter((p) => p.guests >= guests);
  if (checkIn && checkOut && checkOut > checkIn) {
    const taken = await getUnavailableDates();
    list = list.filter((p) => !taken.some((t) => t.propertyId === p.id && t.checkIn < checkOut && t.checkOut > checkIn));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="caps text-xs text-sky">Stay with us</p>
      <h1 className="display mt-2 text-5xl text-charcoal">Our homes</h1>
      <div className="mt-8"><SearchBar compact defaults={{ region, check_in: checkIn, check_out: checkOut, guests: guests ? String(guests) : "2" }} /></div>
      <p className="ui mt-6 text-sm text-muted">
        {list.length} {list.length === 1 ? "home" : "homes"}{checkIn && checkOut ? ` available ${checkIn} to ${checkOut}` : ""}
      </p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && (
        <p className="mt-10 text-muted">Nothing matches those dates. Try different dates, or <a href="/contact" className="text-teal underline">ask us</a>; we sometimes know of a gap.</p>
      )}
    </main>
  );
}
