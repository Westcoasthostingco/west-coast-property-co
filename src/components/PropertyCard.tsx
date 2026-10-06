import Link from "next/link";
import PropertyImage, { coverPhoto } from "./PropertyImage";
import CardReel from "./CardReel";
import type { Property } from "@/lib/data";
import { getListingContent } from "@/lib/listing-content";
import ConditionsCard from "./widgets/ConditionsCard";

export default function PropertyCard({ p, wide = false }: { p: Property; wide?: boolean }) {
  const content = getListingContent(p.slug);
  const listing = content?.listingRating;
  const href = `/properties/${p.slug}`;
  const cover = coverPhoto(p.slug);
  // Cover photo first, then the home's featured listing photos, as a swipeable reel.
  const slides = [
    ...(cover ? [{ src: cover, alt: p.name }] : []),
    ...(content ? content.featured.map((i) => content.photos[i]).filter(Boolean).map((ph) => ({ src: ph.src, alt: `${p.name}: ${ph.room.toLowerCase()}` })) : []),
  ];
  const aspect = wide ? "aspect-[4/3]" : "aspect-[5/4]";
  return (
    <div className="group flex h-full flex-col">
      {slides.length > 0
        ? <CardReel slides={slides} href={href} name={p.name} className={aspect} />
        : <Link href={href}><PropertyImage slug={p.slug} name={p.name} className={`rounded-2xl ${aspect}`} /></Link>}
      <Link href={href} className="mt-3 flex items-start justify-between gap-3">
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
      </Link>
      {/* Live tide or snow conditions, pinned to the bottom so the strips line up across cards */}
      <div className="mt-auto pt-4"><ConditionsCard tideStationId={p.tideStationId} skiResort={p.skiResort} /></div>
    </div>
  );
}
