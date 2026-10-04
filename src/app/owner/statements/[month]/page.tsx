import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatTile from "@/components/StatTile";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import PrintButton from "@/components/owner/PrintButton";
import { money } from "@/lib/data";
import { feeSentence, fmtDate, fmtRange, getOwnerData, isMonthKey, loadOwner, monthTitle, statementFor } from "@/lib/owner";

type Props = { params: Promise<{ month: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  return { title: isMonthKey(month) ? `${monthTitle(month)} statement` : "Statement" };
}

// Printable: the site header, footer and portal nav hide under @media print.
export default async function OwnerStatement({ params }: Props) {
  const { month } = await params;
  if (!isMonthKey(month)) notFound();
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const data = await getOwnerData(owner);
  const s = statementFor(month, data, owner);
  const channels = ["Airbnb", "Vrbo", "Booking.com"];
  const paidBy = (source: string) => `Paid by ${channels.includes(source) ? source : "Airbnb/Vrbo"}`;
  const amount = (l: (typeof s.lines)[number], v: number) => (l.recorded ? money(v) : <span className="text-muted">n/a</span>);
  const unrecorded = s.lines.filter((l) => !l.recorded).length;

  return (
    <>
      <style>{`@media print {
        header, footer, nav { display: none !important; }
        body { background: #fff; color: #000; }
        main { gap: 1rem; }
        .rounded-2xl { border-radius: 0 !important; }
        a { color: inherit; text-decoration: none; }
        @page { margin: 16mm; }
      }`}</style>

      <PageHeader eyebrow="Statement" title={monthTitle(month)}
        intro={`Prepared for ${owner.name}. Stays are listed by check-in date. ${feeSentence(data, owner)}`}
        actions={<>
          <Link href="/owner/statements" className="caps-tight rounded-full border border-line px-4 py-2 text-[0.65rem] text-muted transition hover:border-deep hover:text-deep">All statements</Link>
          <PrintButton />
        </>} />

      <div className="hidden print:block">
        <p className="caps text-xs">West Coast Hosting Co</p>
        <p className="ui mt-1 text-xs">Owner statement for {owner.name} ({owner.email}). Generated {fmtDate(new Date().toISOString().slice(0, 10), { month: "long", day: "numeric", year: "numeric" })}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Stays" value={String(s.stays)} hint={`${s.nights} ${s.nights === 1 ? "night" : "nights"}`} />
        <StatTile label="Nights revenue" value={money(s.gross)} hint={`${s.recordedStays} of ${s.stays} stays with amounts on file`} />
        <StatTile label="Our fees" value={money(s.percentFee + s.fixedFee)} hint={`${money(s.percentFee)} % fee + ${money(s.fixedFee)} fixed`} />
        <StatTile label="Net of our fees" value={money(s.net)} hint="Recorded stays, before any invoices" />
      </div>

      <DataTable
        columns={[{ label: "Home", wrap: true }, { label: "Dates" }, { label: "Guest", wrap: true }, { label: "Nights", align: "right" }, { label: "Gross", align: "right" }, { label: "% fee", align: "right" }, { label: "Fixed fee", align: "right" }, { label: "Cleaning", align: "right" }, { label: "Net", align: "right" }, { label: "Source" }]}
        empty="No stays checked in this month."
        rows={s.lines.map((l) => [
          l.propertyName, fmtRange(l.booking.checkIn, l.booking.checkOut), l.booking.guest,
          l.nights, amount(l, l.gross),
          l.recorded ? <span key="pf">{money(l.percentFee)} <span className="text-xs text-muted">({l.feePercent}%)</span></span> : amount(l, 0),
          money(l.fixedFee), money(l.cleaning), <span key="n" className="font-medium">{amount(l, l.net)}</span>,
          <span key="p" className="text-xs text-muted">{l.recorded ? `${l.booking.source} · amounts on file` : paidBy(l.booking.source)}</span>,
        ])}
        footer={["Total", "", "", s.nights, money(s.gross), money(s.percentFee), money(s.fixedFee), money(s.cleaning), money(s.net), ""]}
      />

      <div className="space-y-2 text-sm leading-relaxed text-muted">
        <p>
          Guests pay Airbnb or Vrbo when they book, and the platform pays you directly on its own payout schedule, under its payout rules and your Management Agreement. This statement is a record of the stays; no money is sent from this site.
        </p>
        {unrecorded > 0 && (
          <p>
            {unrecorded} {unrecorded === 1 ? "stay was" : "stays were"} imported from the platform calendar without amounts, so gross, % fee and net are not shown for {unrecorded === 1 ? "it" : "them"}; the fixed fee and cleaning fee still apply per stay. See your Airbnb or Vrbo earnings for those payouts.
          </p>
        )}
        <p>
          Net is gross less our % fee and fixed fee. The cleaning fee ({money(s.cleaning)} this month) covers each turnover; it is not part of your nights revenue and is not taken from net. Total charged this month: {money(s.totalFees)} (% fee, fixed fee and cleaning). Lodging tax is collected and remitted separately.
        </p>
      </div>
    </>
  );
}
