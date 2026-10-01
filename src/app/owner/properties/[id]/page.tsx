import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import PropertyImage from "@/components/PropertyImage";
import TimeSeries from "@/components/charts/TimeSeries";
import AlmostThere from "@/components/owner/AlmostThere";
import Card from "@/components/owner/Card";
import DataTable from "@/components/owner/DataTable";
import HeadlineTiles from "@/components/owner/HeadlineTiles";
import PageHeader from "@/components/owner/PageHeader";
import Pill, { stayTone } from "@/components/owner/Pill";
import { getPublishedReviews, getUnavailableDates, money } from "@/lib/data";
import { lastMonths, monthLabel, monthlyMetrics } from "@/lib/metrics";
import { fmtRange, getOwnerData, headline, loadOwner, nightsBetween, todayIso } from "@/lib/owner";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const owner = await loadOwner();
  const name = owner ? (await getOwnerData(owner)).properties.find((p) => p.id === id)?.name : undefined;
  return { title: name ?? "Property" };
}

export default async function OwnerProperty({ params }: Props) {
  const { id } = await params;
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;

  const data = await getOwnerData(owner);
  const property = data.properties.find((p) => p.id === id);
  if (!property) notFound(); // not theirs, or does not exist: same answer

  const bookings = data.bookings.filter((b) => b.propertyId === id);
  const [reviews, taken] = await Promise.all([getPublishedReviews(id), getUnavailableDates(id)]);
  const h = headline(bookings, [property]);
  const trend = monthlyMetrics(bookings, [property], lastMonths(12));
  const today = todayIso();
  const stays = bookings.filter((b) => b.status !== "cancelled").sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return (
    <>
      <PageHeader eyebrow={`${property.city}, ${property.region}`} title={property.name}
        intro={`${property.bedrooms} bed, ${property.bathrooms} bath, sleeps ${property.guests}. Listed at ${money(property.nightlyRate)} a night plus a ${money(property.cleaningFee)} cleaning fee.`}
        actions={<Link href={`/properties/${property.slug}`} className="caps-tight rounded-full border border-deep px-4 py-2 text-[0.65rem] text-deep transition hover:bg-deep hover:text-white">View public listing</Link>} />

      <PropertyImage slug={property.slug} name={property.name} className="h-40 rounded-2xl sm:h-56" />

      <HeadlineTiles h={h} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue by month" aside={<span className="ui text-xs text-muted">Last 12 months</span>}>
          <TimeSeries title={`${property.name} revenue by month`} height={150} points={trend.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))} format="money" />
        </Card>
        <Card title="Occupancy by month" aside={<span className="ui text-xs text-muted">Last 12 months</span>}>
          <TimeSeries kind="bar" title={`${property.name} occupancy by month`} height={150} points={trend.map((m) => ({ label: monthLabel(m.month), value: Math.round(m.occupancy * 100) }))} format="percent" />
        </Card>
      </div>

      <Card title="Next three months" aside={<span className="ui text-xs text-muted">Booked nights shaded</span>}>
        <AvailabilityCalendar stays={taken} />
      </Card>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="caps-tight text-[0.65rem] text-deep">Stays</h2>
          <span className="ui text-xs text-muted">{stays.length} total</span>
        </div>
        <DataTable
          columns={[{ label: "Dates" }, { label: "Guest" }, { label: "Source" }, { label: "Nights", align: "right" }, { label: "Nights revenue", align: "right" }, { label: "Status" }]}
          empty="No stays yet for this home."
          rows={stays.map((b) => [
            <span key="d" className={b.checkIn >= today ? "text-charcoal" : "text-muted"}>{fmtRange(b.checkIn, b.checkOut)}</span>,
            b.guest, b.source, nightsBetween(b.checkIn, b.checkOut), money(b.subtotal ?? b.total),
            <Pill key="s" tone={stayTone(b.status)}>{b.status}</Pill>,
          ])}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="caps-tight text-[0.65rem] text-deep">Published reviews</h2>
          <span className="ui text-xs text-muted">{property.rating ? `${property.rating.toFixed(1)} average` : ""}</span>
        </div>
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-muted">No published reviews yet. We ask every guest after checkout.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-2xl border border-line bg-white p-5">
                <p className="ui text-xs text-deep" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
                <p className="mt-2 leading-relaxed text-charcoal">{r.body}</p>
                <footer className="ui mt-3 text-xs text-muted">{r.guest}</footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
