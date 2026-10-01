import Link from "next/link";
import { money, type Property } from "@/lib/data";

export default function PropertyCard({ p }: { p: Property }) {
  return (
    <Link href={`/properties/${p.slug}`} className="group block overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex h-44 items-end bg-gradient-to-br from-brand to-brand-dark p-4 text-sm text-white/80">
        {p.city}, {p.region}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-semibold group-hover:text-brand">{p.name}</h3>
        <p className="text-sm text-muted">
          {p.bedrooms} bd · {p.bathrooms} ba · sleeps {p.guests}
        </p>
        <p className="text-sm">
          <span className="font-semibold">{money(p.nightlyRate)}</span> / night · ★ {p.rating} ({p.reviewCount})
        </p>
      </div>
    </Link>
  );
}
