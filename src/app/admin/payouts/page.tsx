import type { Metadata } from "next";
import Link from "next/link";
import StatTile from "@/components/StatTile";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, DataTable, Notice, PageHeader, Pill, buttonClass, ghostButtonClass } from "@/components/admin/ui";
import { retryPayoutAction, runPayoutsAction } from "@/app/admin/actions";
import { getAllProperties, getBookings, getOwners, money, nameMap } from "@/lib/data";
import { fmtDate, getPayoutsDetailed, todayISO } from "@/lib/admin";
import { supabaseConfigured } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Payouts" };

export default async function AdminPayouts({ searchParams }: PageProps<"/admin/payouts">) {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const PAGE_SIZE = 50;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : 1) || 1);
  const [payouts, owners, props, bookings] = await Promise.all([getPayoutsDetailed(), getOwners(), getAllProperties(), getBookings()]);
  const ownerName = nameMap(owners);
  const propertyOf = (bookingId: string) => nameMap(props)(bookings.find((b) => b.id === bookingId)?.propertyId ?? "");
  const today = todayISO();
  const due = payouts.filter((x) => x.status === "scheduled" && x.releaseOn <= today);
  const scheduled = payouts.filter((x) => x.status === "scheduled" && x.releaseOn > today);
  const failed = payouts.filter((x) => x.status === "failed");
  const paidThisMonth = payouts.filter((x) => x.status === "paid" && x.releaseOn.startsWith(today.slice(0, 7)));
  const filtered = (status ? payouts.filter((x) => x.status === status) : payouts).slice().sort((a, b) => (a.releaseOn < b.releaseOn ? 1 : a.releaseOn > b.releaseOn ? -1 : 0));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const list = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const pageHref = (n: number) => `/admin/payouts?${new URLSearchParams({ ...(status ? { status } : {}), ...(n > 1 ? { page: String(n) } : {}) }).toString()}`.replace(/\?$/, "");
  const canRun = supabaseConfigured && Boolean(process.env.CRON_SECRET);

  return (
    <>
      <PageHeader eyebrow="Owner transfers" title="Payouts" intro="Guest payments pass through to each owner's Stripe Connect account the day after check-in, less the management fee."
        actions={
          <form action={runPayoutsAction}>
            <ConfirmButton className={buttonClass} message="Run the payout job now? Every released payout is transferred to its owner.">Run payouts now</ConfirmButton>
          </form>
        } />
      <Notice searchParams={sp} />
      {!canRun && <p className="ui text-xs text-muted">{supabaseConfigured ? "CRON_SECRET is not set; the daily Vercel cron and this button both need it." : "Sample mode: the run button reports without transferring."}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Released, awaiting run" value={money(due.reduce((s, x) => s + x.net, 0))} hint={`${due.length} payout${due.length === 1 ? "" : "s"} due now`} />
        <StatTile label="Scheduled" value={money(scheduled.reduce((s, x) => s + x.net, 0))} hint={`${scheduled.length} upcoming`} />
        <StatTile label="Paid this month" value={money(paidThisMonth.reduce((s, x) => s + x.net, 0))} hint={`${paidThisMonth.length} transfers`} />
        <StatTile label="Failed" value={String(failed.length)} hint={failed.length ? "Needs attention below" : "All clear"} />
      </div>

      {failed.length > 0 && (
        <Card title="Failed payouts" className="border-[#e6b8a2]">
          <ul className="ui divide-y divide-line text-sm">
            {failed.map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium text-charcoal">{ownerName(x.ownerId)} · {money(x.net)} · <Link href={`/admin/bookings/${x.bookingId}`} className="text-deep hover:underline">{propertyOf(x.bookingId)}</Link></p>
                  <p className="text-xs text-[#b6633a]">{x.lastError ?? "Unknown error"}</p>
                </div>
                <form action={retryPayoutAction.bind(null, x.id)}><button type="submit" className={ghostButtonClass}>Requeue</button></form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="ui flex flex-wrap gap-2 text-xs">
        {["", "scheduled", "processing", "paid", "failed", "reversed"].map((s) => (
          <Link key={s} href={s ? `/admin/payouts?status=${s}` : "/admin/payouts"} className={`rounded-full border px-3 py-1 ${status === s ? "border-deep bg-deep text-white" : "border-line bg-white text-muted hover:text-charcoal"}`}>{s || "All"}</Link>
        ))}
      </div>

      <DataTable head={["Release", "Owner", "Home", "Gross", "Fee", "Net", "Status", "Transfer"]} empty="No payouts in this view."
        rows={list.map((x) => [
          <Link key="r" href={`/admin/bookings/${x.bookingId}`} className="font-medium text-charcoal hover:text-deep">{fmtDate(x.releaseOn, { month: "short", day: "numeric", year: "numeric" })}</Link>,
          ownerName(x.ownerId), propertyOf(x.bookingId), money(x.gross), money(x.fee), money(x.net),
          <span key="s"><Pill value={x.status} />{x.lastError && x.status !== "failed" && <span className="ml-2 text-xs text-muted" title={x.lastError}>held</span>}</span>,
          x.transferId ? <span key="t" className="text-xs text-muted">{x.transferId}</span> : "—",
        ])} />
      {filtered.length > PAGE_SIZE && (
        <nav aria-label="Payout pages" className="ui flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}, newest release first</span>
          <span className="flex gap-2">
            {current > 1 ? <Link href={pageHref(current - 1)} className={ghostButtonClass}>← Newer</Link> : <span className={`${ghostButtonClass} opacity-50`} aria-disabled>← Newer</span>}
            <span className="self-center">Page {current} of {pages}</span>
            {current < pages ? <Link href={pageHref(current + 1)} className={ghostButtonClass}>Older →</Link> : <span className={`${ghostButtonClass} opacity-50`} aria-disabled>Older →</span>}
          </span>
        </nav>
      )}
    </>
  );
}
