import Link from "next/link";
import PropertyImage from "./PropertyImage";
import { money, type Property } from "@/lib/data";

export default function PropertyCard({ p, wide = false }: { p: Property; wide?: boolean }) {
  return (
    <Link href={`/properties/${p.slug}`} className="group block">
      <PropertyImage slug={p.slug} name={p.name} className={`rounded-2xl transition group-hover:opacity-95 ${wide ? "aspect-[4/3]" : "aspect-[5/4]"}`} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="caps-tight text-[0.65rem] text-deep">{p.city}, {p.region}</p>
          <h3 className="display mt-0.5 text-2xl text-charcoal group-hover:text-deep">{p.name}</h3>
          <p className="ui mt-1 text-xs text-muted">{p.bedrooms} bedrooms · {p.bathrooms} baths · sleeps {p.guests}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="ui text-sm font-medium">{money(p.nightlyRate)}<span className="text-xs font-normal text-muted"> /night</span></p>
          {p.reviewCount > 0 && <p className="ui mt-0.5 text-xs text-muted">★ {p.rating.toFixed(1)} · {p.reviewCount}</p>}
        </div>
      </div>
    </Link>
  );
}
