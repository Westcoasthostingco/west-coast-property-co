import type { Metadata } from "next";
import Link from "next/link";
import PropertyImage from "@/components/PropertyImage";
import TimeSeries from "@/components/charts/TimeSeries";
import AlmostThere from "@/components/owner/AlmostThere";
import PageHeader from "@/components/owner/PageHeader";
import { money } from "@/lib/data";
import { lastMonths, monthLabel, monthlyMetrics } from "@/lib/metrics";
import { getOwnerData, loadOwner, percent } from "@/lib/owner";

export const metadata: Metadata = { title: "Properties" };

// One small chart per home (small multiples) so homes can be compared at a
// glance without stacking lines on a single chart.
export default async function OwnerProperties() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const { properties, bookings } = await getOwnerData(owner);
  const months = lastMonths(12);

  return (
    <>
      <PageHeader eyebrow="Your homes" title="Properties" intro="Each home on its own, with the same twelve months of revenue so the shapes are easy to compare." />
      {properties.length === 0 && (
        <p className="rounded-2xl border border-line bg-white p-6 text-muted">No homes are linked to your account yet. The team will add them for you.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((p) => {
          const own = bookings.filter((b) => b.propertyId === p.id);
          const trend = monthlyMetrics(own, [p], months);
          const now = trend[trend.length - 1];
          return (
            <Link key={p.id} href={`/owner/properties/${p.id}`} className="group overflow-hidden rounded-2xl border border-line bg-white transition hover:border-sky">
              <PropertyImage slug={p.slug} name={p.name} className="h-32" />
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="display text-2xl text-charcoal group-hover:text-teal-dark">{p.name}</h2>
                  <span className="ui text-xs text-muted">{p.city}, {p.region}</span>
                </div>
                <dl className="ui mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="caps-tight text-[0.6rem] text-sky">This month</dt><dd className="mt-1 text-charcoal">{money(now.revenue)}</dd></div>
                  <div><dt className="caps-tight text-[0.6rem] text-sky">Occupancy</dt><dd className="mt-1 text-charcoal">{percent(now.occupancy)}</dd></div>
                  <div><dt className="caps-tight text-[0.6rem] text-sky">Avg. rate</dt><dd className="mt-1 text-charcoal">{now.adr ? money(now.adr) : "—"}</dd></div>
                </dl>
                <div className="mt-4">
                  <TimeSeries title={`${p.name} revenue by month`} height={120} points={trend.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))} format="money" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
