import type { Metadata } from "next";
import TimeSeries from "@/components/charts/TimeSeries";
import { Card, PageHeader, ghostButtonClass } from "@/components/admin/ui";
import { getAllProperties, money } from "@/lib/data";
import { getAllJobs } from "@/lib/cleaning";
import { getBookingsDetailed, getPayoutsDetailed } from "@/lib/admin";
import { lastMonths, monthLabel, monthlyMetrics } from "@/lib/metrics";

export const metadata: Metadata = { title: "Accounting" };

export default async function Accounting() {
  const [props, bookings, payouts, jobs] = await Promise.all([getAllProperties(), getBookingsDetailed(), getPayoutsDetailed(), getAllJobs()]);
  const months = lastMonths(12);
  const metrics = monthlyMetrics(bookings, props, months);
  const from = `${months[0]}-01`, to = new Date().toISOString().slice(0, 10);

  const byMonth = (pick: (m: string) => number) => months.map((m) => ({ label: monthLabel(m), value: Math.round(pick(m)) }));
  const live = payouts.filter((x) => x.status !== "reversed");
  const fees = byMonth((m) => live.filter((x) => x.releaseOn.startsWith(m)).reduce((s, x) => s + x.fee, 0));
  const net = byMonth((m) => live.filter((x) => x.releaseOn.startsWith(m)).reduce((s, x) => s + x.net, 0));
  const cleaning = byMonth((m) => jobs.filter((j) => j.status === "done" && j.scheduledDate.startsWith(m)).reduce((s, j) => s + (j.cost ?? 0), 0));
  const tax = byMonth((m) => bookings.filter((b) => b.status !== "cancelled" && b.status !== "pending" && b.checkIn.startsWith(m)).reduce((s, b) => s + b.tax, 0));
  const revenue = metrics.map((m) => ({ label: monthLabel(m.month), value: m.revenue }));
  const sum = (pts: { value: number }[]) => pts.reduce((s, p) => s + p.value, 0);

  const series = [
    { title: "Revenue", hint: "Nights subtotal, prorated by night", points: revenue },
    { title: "Management fees", hint: "Earned on payouts released in month", points: fees },
    { title: "Net to owners", hint: "Payouts released in month", points: net },
    { title: "Cleaning cost", hint: "Done jobs, by turnover date", points: cleaning },
    { title: "Lodging tax collected", hint: "By check-in month; remitted to the state", points: tax },
  ];

  return (
    <>
      <PageHeader eyebrow="Books" title="Accounting" intro={`Trailing 12 months, ${monthLabel(months[0])} to ${monthLabel(months[11])}.`}
        actions={
          <>
            <a href={`/api/admin/export?kind=bookings&from=${from}&to=${to}`} className={ghostButtonClass} download>Bookings CSV</a>
            <a href={`/api/admin/export?kind=payouts&from=${from}&to=${to}`} className={ghostButtonClass} download>Payouts CSV</a>
          </>
        } />

      <div className="grid gap-4 md:grid-cols-2">
        {series.map((s) => (
          <Card key={s.title}>
            <div className="flex items-baseline justify-between">
              <h2 className="caps-tight text-[0.68rem] text-sky">{s.title}</h2>
              <span className="ui text-sm text-charcoal">{money(sum(s.points))} <span className="text-xs text-muted">12 mo</span></span>
            </div>
            <p className="ui text-[0.7rem] text-muted">{s.hint}</p>
            <div className="mt-2"><TimeSeries title={`${s.title} by month`} points={s.points} format={money} height={160} /></div>
          </Card>
        ))}
        <Card title="QuickBooks">
          <p className="display text-2xl text-charcoal">Sync coming after launch.</p>
          <p className="ui mt-2 text-sm text-muted">Until then, use the CSV exports above for your accountant. The planned sync posts one journal entry per booking (gross to owner funds payable, fee to revenue, tax to liability) and one per payout, nightly.</p>
          <p className="ui mt-3 text-xs text-muted">Status: not connected · last run: never</p>
        </Card>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="caps-tight text-[0.68rem] text-sky">Revenue by home</h2>
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
                <div className="mt-2"><TimeSeries title={`${p.name} revenue by month`} points={pts} format={money} height={120} /></div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
