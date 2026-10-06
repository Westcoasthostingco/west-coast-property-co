import Link from "next/link";
import PropertyImage from "./PropertyImage";
import type { Property } from "@/lib/data";
import { getListingContent } from "@/lib/listing-content";
import ConditionsCard from "./widgets/ConditionsCard";

export default function PropertyCard({ p, wide = false }: { p: Property; wide?: boolean }) {
  const listing = getListingContent(p.slug)?.listingRating;
  return (
    <Link href={`/properties/${p.slug}`} className="group flex h-full flex-col">
      <PropertyImage slug={p.slug} name={p.name} className={`rounded-2xl transition group-hover:opacity-95 ${wide ? "aspect-[4/3]" : "aspect-[5/4]"}`} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="caps-tight text-[0.65rem] text-deep">{p.city}, {p.region}</p>
          <h3 className="display mt-0.5 text-2xl text-charcoal group-hover:text-deep">{p.name}</h3>
          <p className="ui mt-1 text-xs text-muted">{p.bedrooms} bedrooms · {p.bathrooms} baths · sleeps {p.guests}</p>
        </div>
        <div className="shrink-0 text-right">
          {listing ? (
            <p className="ui text-sm font-medium">★ {listing.value.toFixed(2)}<span className="text-xs font-normal text-muted"> · {listing.count} on {listing.platform}</span></p>
          ) : p.reviewCount > 0 && <p className="ui text-sm font-medium">★ {p.rating.toFixed(1)}<span className="text-xs font-normal text-muted"> · {p.reviewCount}</span></p>}
          <p className="ui mt-0.5 text-xs text-muted">{p.airbnbUrl || p.vrboUrl ? `Book on ${[p.airbnbUrl && "Airbnb", p.vrboUrl && "Vrbo"].filter(Boolean).join(" · ")}` : "Listing coming soon"}</p>
        </div>
      </div>
      {/* Live tide or snow conditions, pinned to the bottom so the strips line up across cards */}
      <div className="mt-auto pt-4"><ConditionsCard tideStationId={p.tideStationId} skiResort={p.skiResort} /></div>
    </Link>
  );
}
