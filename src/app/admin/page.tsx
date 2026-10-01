import Link from "next/link";
import StatTile from "@/components/StatTile";
import TimeSeries from "@/components/charts/TimeSeries";
import { Card, DataTable, Empty, PageHeader, Pill } from "@/components/admin/ui";
import { getAllProperties, getBookings, getPayouts, money, nameMap } from "@/lib/data";
import { getAllJobs } from "@/lib/cleaning";
import { addDays, fmtDate, getOpenMaintenanceCount, todayISO } from "@/lib/admin";
import { lastMonths, monthLabel, monthlyMetrics } from "@/lib/metrics";

export default async function AdminHome() {
  const [props, bookings, payouts, jobs, openMaintenance] = await Promise.all([
    getAllProperties(), getBookings(), getPayouts(), getAllJobs(), getOpenMaintenanceCount(),
  ]);
  const propertyName = nameMap(props);
  const today = todayISO();
  const months = lastMonths(12);
  const metrics = monthlyMetrics(bookings, props, months);
  const thisMonth = metrics[metrics.length - 1];
  const lastMonth = metrics[metrics.length - 2];
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);

  const monthKey = today.slice(0, 7);
  const feesThisMonth = payouts.filter((x) => x.releaseOn.startsWith(monthKey) && x.status !== "reversed").reduce((s, x) => s + x.fee, 0);
  const weekEnd = addDays(today, 7);
  const dueThisWeek = payouts.filter((x) => x.status === "scheduled" && x.releaseOn >= today && x.releaseOn <= weekEnd);

  const active = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const checkIns = active.filter((b) => b.checkIn >= today && b.checkIn <= weekEnd).sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const checkOuts = active.filter((b) => b.checkOut >= today && b.checkOut <= weekEnd).sort((a, b) => a.checkOut.localeCompare(b.checkOut));
  const unassigned = jobs.filter((j) => j.status === "unassigned" && j.scheduledDate >= today && j.scheduledDate <= addDays(today, 14));

  const stayRow = (kind: "in" | "out") => (b: (typeof bookings)[number]) => [
    <Link key="d" href={`/admin/bookings/${b.id}`} className="font-medium text-charcoal hover:text-teal">{fmtDate(kind === "in" ? b.checkIn : b.checkOut, { weekday: "short", month: "short", day: "numeric" })}</Link>,
    propertyName(b.propertyId), b.guest, b.source, <Pill key="s" value={b.status} />,
  ];

  return (
    <>
      <PageHeader eyebrow="Overview" title="Good day, team." intro={`${fmtDate(today, { weekday: "long", month: "long", day: "numeric" })} · ${props.length} homes`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Revenue this month" value={money(thisMonth.revenue)} delta={{ value: pct(thisMonth.revenue, lastMonth.revenue) }} hint="Nights subtotal, prorated by night" />
        <StatTile label="Occupancy" value={`${Math.round(thisMonth.occupancy * 100)}%`} delta={{ value: Math.round((thisMonth.occupancy - lastMonth.occupancy) * 100), suffix: " pts" }} />
        <StatTile label="Management fees" value={money(feesThisMonth)} hint="Released this month" />
        <StatTile label="Payouts due this week" value={money(dueThisWeek.reduce((s, x) => s + x.net, 0))} hint={`${dueThisWeek.length} transfer${dueThisWeek.length === 1 ? "" : "s"} scheduled`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link href="/admin/cleaning" className="rounded-2xl border border-line bg-white p-5 transition hover:border-teal">
          <p className="caps-tight text-[0.65rem] text-sky">Cleanings unassigned</p>
          <p className="display mt-2 text-4xl not-italic text-charcoal">{unassigned.length}</p>
          <p className="ui mt-1 text-xs text-muted">Next 14 days · tap to assign</p>
        </Link>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="caps-tight text-[0.65rem] text-sky">Open maintenance</p>
          <p className="display mt-2 text-4xl not-italic text-charcoal">{openMaintenance}</p>
          <p className="ui mt-1 text-xs text-muted">Tickets open or in progress</p>
        </div>
        <Link href="/admin/calendar" className="rounded-2xl border border-line bg-white p-5 transition hover:border-teal">
          <p className="caps-tight text-[0.65rem] text-sky">Turnovers this week</p>
          <p className="display mt-2 text-4xl not-italic text-charcoal">{checkOuts.length}</p>
          <p className="ui mt-1 text-xs text-muted">{checkIns.length} arrival{checkIns.length === 1 ? "" : "s"} · open the calendar</p>
        </Link>
      </div>

      <Card title="Revenue, last 12 months">
        <TimeSeries title="Portfolio revenue by month" points={metrics.map((m) => ({ label: monthLabel(m.month), value: m.revenue }))} format="money" height={200} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2">
          <h2 className="caps-tight text-[0.68rem] text-sky">Check-ins, next 7 days</h2>
          {checkIns.length ? <DataTable head={["Arrives", "Home", "Guest", "Source", "Status"]} rows={checkIns.map(stayRow("in"))} /> : <Empty>No arrivals this week.</Empty>}
        </section>
        <section className="space-y-2">
          <h2 className="caps-tight text-[0.68rem] text-sky">Check-outs, next 7 days</h2>
          {checkOuts.length ? <DataTable head={["Departs", "Home", "Guest", "Source", "Status"]} rows={checkOuts.map(stayRow("out"))} /> : <Empty>No departures this week.</Empty>}
        </section>
      </div>
    </>
  );
}
