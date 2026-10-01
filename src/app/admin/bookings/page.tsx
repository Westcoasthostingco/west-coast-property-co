import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, LinkButton, Notice, PageHeader, Pill, inputClass } from "@/components/admin/ui";
import { getAllProperties, getBookings, money, nameMap } from "@/lib/data";
import { fmtDate, nightsBetween, todayISO } from "@/lib/admin";

export const metadata: Metadata = { title: "Bookings" };

const statuses = ["confirmed", "pending", "completed", "cancelled"];

export default async function AdminBookings({ searchParams }: PageProps<"/admin/bookings">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const propertyId = typeof sp.property === "string" ? sp.property : "";
  const when = sp.when === "past" ? "past" : sp.when === "all" ? "all" : "upcoming";
  const today = todayISO();

  const [bookings, props] = await Promise.all([getBookings(), getAllProperties()]);
  const propertyName = nameMap(props);
  const list = bookings
    .filter((b) => !status || b.status === status)
    .filter((b) => !propertyId || b.propertyId === propertyId)
    .filter((b) => when === "all" || (when === "past" ? b.checkOut < today : b.checkOut >= today))
    .sort((a, b) => (when === "past" ? b.checkIn.localeCompare(a.checkIn) : a.checkIn.localeCompare(b.checkIn)));
  const total = list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);

  return (
    <>
      <PageHeader eyebrow="Reservations" title="Bookings" intro={`${list.length} stays · ${money(total)} guest total`}
        actions={<LinkButton href="/admin/bookings/new">+ Manual booking</LinkButton>} />
      <Notice searchParams={sp} />

      <form method="get" className="ui grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <select name="when" defaultValue={when} className={inputClass} aria-label="Timeframe">
          <option value="upcoming">Upcoming and current</option>
          <option value="past">Past</option>
          <option value="all">All</option>
        </select>
        <select name="status" defaultValue={status} className={inputClass} aria-label="Status">
          <option value="">Any status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="property" defaultValue={propertyId} className={inputClass} aria-label="Property">
          <option value="">All homes</option>
          {props.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button type="submit" className="ui rounded-full border border-teal px-4 py-2 text-sm text-teal hover:bg-teal hover:text-white">Filter</button>
      </form>

      <DataTable head={["Check-in", "Nights", "Home", "Guest", "Source", "Status", "Total"]} empty="No stays match these filters."
        rows={list.map((b) => [
          <Link key="d" href={`/admin/bookings/${b.id}`} className="font-medium text-charcoal hover:text-teal">{fmtDate(b.checkIn, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</Link>,
          nightsBetween(b.checkIn, b.checkOut), propertyName(b.propertyId), b.guest, b.source, <Pill key="s" value={b.status} />, money(b.total),
        ])} />
    </>
  );
}
