import type { Metadata } from "next";
import TimeSeries from "@/components/charts/TimeSeries";
import { Card, PageHeader, ghostButtonClass } from "@/components/admin/ui";
import { getAllProperties, getFeeOverrides, getOwners, money } from "@/lib/data";
import { getAllJobs } from "@/lib/cleaning";
import { getBookingsDetailed } from "@/lib/admin";
import { lastMonths, monthLabel, monthlyMetrics, stayMoney } from "@/lib/metrics";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Accounting" };

export default async function Accounting() {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const [props, bookings, owners, feeOverrides, jobs] = await Promise.all([getAllProperties(), getBookingsDetailed(), getOwners(), getFeeOverrides(), getAllJobs()]);
  const months = lastMonths(12);
  const metrics = monthlyMetrics(bookings, props, months);
  const from = `${months[0]}-01`, to = new Date().toISOString().slice(0, 10);

  const byMonth = (pick: (m: string) => number) => months.map((m) => ({ label: monthLabel(m), value: Math.round(pick(m)) }));
  // Fee split per stay from recorded booking money (iCal-imported stays have none).
  const ownerFee = (propertyId: string) => owners.find((o) => o.id === props.find((p) => p.id === propertyId)?.ownerId)?.feePercent ?? 0;
  const split = bookings.map((b) => ({ month: b.checkIn.slice(0, 7), m: stayMoney(b, feeOverrides[b.propertyId], ownerFee(b.propertyId)) }));
  const fees = byMonth((m) => split.filter((x) => x.month === m).reduce((s, x) => s + (x.m?.fee ?? 0), 0));
  const net = byMonth((m) => split.filter((x) => x.month === m).reduce((s, x) => s + (x.m?.net ?? 0), 0));
  const cleaning = byMonth((m) => jobs.filter((j) => j.status === "done" && j.scheduledDate.startsWith(m)).reduce((s, j) => s + (j.cost ?? 0), 0));
  const tax = byMonth((m) => bookings.filter((b) => b.status !== "cancelled" && b.status !== "pending" && b.checkIn.startsWith(m)).reduce((s, b) => s + b.tax, 0));
  const revenue = metrics.map((m) => ({ label: monthLabel(m.month), value: m.revenue }));
  const sum = (pts: { value: number }[]) => pts.reduce((s, p) => s + p.value, 0);

  const series = [
    { title: "Revenue", hint: "Nights subtotal, prorated by night", points: revenue },
    { title: "Management fees", hint: "Recorded stays, by check-in month", points: fees },
    { title: "Owner share", hint: "Recorded nights less our fee, by check-in month; paid by the platform", points: net },
    { title: "Cleaning cost", hint: "Done jobs, by turnover date", points: cleaning },
    { title: "Lodging tax collected", hint: "By check-in month; remitted to the state", points: tax },
  ];

  return (
    <>
      <PageHeader eyebrow="Books" title="Accounting" intro={`Trailing 12 months, ${monthLabel(months[0])} to ${monthLabel(months[11])}.`}
        actions={
          <>
            <a href={`/api/admin/export?kind=bookings&from=${from}&to=${to}`} className={ghostButtonClass} download>Bookings CSV</a>
          </>
        } />

      <div className="grid gap-4 md:grid-cols-2">
        {series.map((s) => (
          <Card key={s.title}>
            <div className="flex items-baseline justify-between">
              <h2 className="caps-tight text-[0.68rem] text-deep">{s.title}</h2>
              <span className="ui text-sm text-charcoal">{money(sum(s.points))} <span className="text-xs text-muted">12 mo</span></span>
            </div>
            <p className="ui text-[0.7rem] text-muted">{s.hint}</p>
            <div className="mt-2"><TimeSeries title={`${s.title} by month`} points={s.points} format="money" height={160} /></div>
          </Card>
        ))}
        <Card title="QuickBooks">
          <p className="display text-2xl text-charcoal">Sync coming after launch.</p>
          <p className="ui mt-2 text-sm text-muted">Until then, use the bookings CSV above for your accountant. Guests pay Airbnb or Vrbo and the platform pays owners, so the planned sync posts our management fee per recorded booking, nightly.</p>
          <p className="ui mt-3 text-xs text-muted">Status: not connected · last run: never</p>
        </Card>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="caps-tight text-[0.68rem] text-deep">Revenue by home</h2>
          <p className="ui text-[0.7rem] text-muted">Same scale per chart; compare shape, read totals.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {props.map((p) => {
            const m = monthlyMetrics(bookings.filter((b) => b.propertyId === p.id), [p], months);
            const pts = m.map((x) => ({ label: monthLabel(x.month), value: x.revenue }));
            const occ = Math.round((m.reduce((s, x) => s + x.occupancy, 0) / m.length) * 100);
            return (
              <Card key={p.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="ui text-sm font-medium text-charcoal">{p.name}</h3>
                  <span className="ui text-xs text-muted">{money(sum(pts))} · {occ}% occ.</span>
                </div>
                <div className="mt-2"><TimeSeries title={`${p.name} revenue by month`} points={pts} format="money" height={120} /></div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
