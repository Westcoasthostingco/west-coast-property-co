import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import JsonLd from "@/components/seo/JsonLd";
import { getProperties, getUnavailableDates } from "@/lib/data";
import { itemListJsonLd } from "@/lib/seo";

const description =
  "Three vacation rentals in Washington: The Grand View in Gig Harbor, The Leonora by the Sea on Hood Canal, and The Bedrock near Mount Rainier. Book on Airbnb.";
export const metadata: Metadata = {
  title: "Our homes: vacation rentals in Gig Harbor, Hood Canal & Mount Rainier",
  description,
  alternates: { canonical: "/properties" },
  openGraph: { type: "website", url: "/properties", title: "Our homes | West Coast Hosting Co", description },
  twitter: { card: "summary_large_image", title: "Our homes | West Coast Hosting Co", description },
};

const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Properties({ searchParams }: PageProps<"/properties">) {
  const sp = await searchParams;
  const region = str(sp.region), checkIn = str(sp.check_in), checkOut = str(sp.check_out);
  const guests = Number(str(sp.guests)) || 0;

  const all = await getProperties();
  let list = all;
  if (region) list = list.filter((p) => p.city === region);
  if (guests) list = list.filter((p) => p.guests >= guests);
  if (checkIn && checkOut && checkOut > checkIn) {
    const taken = await getUnavailableDates();
    list = list.filter((p) => !taken.some((t) => t.propertyId === p.id && t.checkIn < checkOut && t.checkOut > checkIn));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <JsonLd data={itemListJsonLd(all)} />
      <p className="caps text-xs text-deep">Stay with us</p>
      <h1 className="display mt-2 text-5xl text-charcoal">Our homes</h1>
      <div className="mt-8"><SearchBar compact defaults={{ region, check_in: checkIn, check_out: checkOut, guests: guests ? String(guests) : "2" }} /></div>
      <p className="ui mt-6 text-sm text-muted">
        {list.length} {list.length === 1 ? "home" : "homes"}{checkIn && checkOut ? ` available ${checkIn} to ${checkOut}` : ""}
      </p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      {list.length === 0 && (
        <p className="mt-10 text-muted">Nothing matches those dates. Try different dates, or <a href="/contact" className="text-deep underline">ask us</a>; we sometimes know of a gap.</p>
      )}
    </main>
  );
}
