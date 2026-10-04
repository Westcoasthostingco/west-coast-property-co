import type { Metadata } from "next";
import Link from "next/link";
import TimeSeries from "@/components/charts/TimeSeries";
import AlmostThere from "@/components/owner/AlmostThere";
import Card from "@/components/owner/Card";
import DataTable from "@/components/owner/DataTable";
import HeadlineTiles from "@/components/owner/HeadlineTiles";
import PageHeader from "@/components/owner/PageHeader";
import Pill, { stayTone } from "@/components/owner/Pill";
import { nameMap } from "@/lib/data";
import { lastMonths, monthLabel, monthlyMetrics } from "@/lib/metrics";
import { fmtRange, getOwnerData, headline, loadOwner, monthTitle, nightsBetween, percent, statementFor, thisMonth, upcomingStays } from "@/lib/owner";

export const metadata: Metadata = { title: "Overview" };

export default async function OwnerOverview() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;

  const data = await getOwnerData(owner);
  const { properties, bookings } = data;
  const propertyName = nameMap(properties);
  const h = headline(bookings, properties);
  const trend = monthlyMetrics(bookings, properties, lastMonths(12));
  const upcoming = upcomingStays(bookings);
  const month = statementFor(thisMonth(), data, owner);
  const firstName = owner.name.split(" ")[0];

  return (
    <>
      <PageHeader eyebrow="Owner portal" title={`Welcome back, ${firstName}`}
        intro={properties.length === 1 ? `Here is how ${properties[0].name} is doing this month.` : `Here is how your ${properties.length} homes are doing this month.`} />

      <HeadlineTiles h={h} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue by month" aside={<span className="ui text-xs text-muted">Last 12 months</span>}>
          <TimeSeries title="Revenue by month, last 12 months" points={trend.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))} format="money" />
        </Card>
        <Card title="Occupancy by month" aside={<span className="ui text-xs text-muted">Last 12 months</span>}>
          <TimeSeries kind="bar" title="Occupancy by month, last 12 months" points={trend.map((m) => ({ label: monthLabel(m.month), value: Math.round(m.occupancy * 100) }))} format="percent" />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="caps-tight text-[0.65rem] text-deep">Upcoming stays</h2>
            <span className="ui text-xs text-muted">Next {upcoming.length}</span>
          </div>
          <DataTable
            columns={[{ label: "Home" }, { label: "Dates" }, { label: "Guest" }, { label: "Source" }, { label: "Nights", align: "right" }, { label: "Status" }]}
            empty="No stays on the books yet. They will show up here as soon as a guest books."
            rows={upcoming.map((b) => [
              <Link key="p" href={`/owner/properties/${b.propertyId}`} className="text-deep hover:underline">{propertyName(b.propertyId)}</Link>,
              fmtRange(b.checkIn, b.checkOut),
              b.guest,
              b.source,
              nightsBetween(b.checkIn, b.checkOut),
              <Pill key="s" tone={stayTone(b.status)}>{b.status}</Pill>,
            ])}
          />
        </section>
        <div className="space-y-4">
          <Card title={monthTitle(thisMonth())}>
            <p className="display text-4xl not-italic text-charcoal">{month.stays} {month.stays === 1 ? "stay" : "stays"}</p>
            <p className="ui mt-1 text-xs text-muted">{month.nights} guest {month.nights === 1 ? "night" : "nights"} checking in this month.</p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Guests pay Airbnb or Vrbo, and the platform pays you on its payout schedule under your Management Agreement.
            </p>
            <Link href="/owner/statements" className="caps-tight mt-4 inline-block text-[0.65rem] text-deep hover:underline">See statements</Link>
          </Card>
          <Card title="Your homes">
            <ul className="ui space-y-2 text-sm">
              {properties.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3">
                  <Link href={`/owner/properties/${p.id}`} className="text-charcoal hover:text-deep">{p.name}</Link>
                  <span className="text-xs text-muted">{percent(monthlyMetrics(bookings.filter((b) => b.propertyId === p.id), [p], lastMonths(1))[0].occupancy)} occ.</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
