import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatTile from "@/components/StatTile";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import PrintButton from "@/components/owner/PrintButton";
import { money } from "@/lib/data";
import { fmtDate, fmtRange, getOwnerData, isMonthKey, loadOwner, monthTitle, statementFor } from "@/lib/owner";

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
  const amount = (l: (typeof s.lines)[number], v: number) => (l.recorded ? money(v) : "");
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
        intro={`Prepared for ${owner.name}. Stays are listed by check-in date. Our fee is ${owner.feePercent}% of the nights subtotal, or the home's own rate where one is set.`}
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
        <StatTile label="Nights revenue" value={money(s.gross)} hint="Stays with amounts on file" />
        <StatTile label="Management fee" value={money(s.fee)} hint="On nights revenue only" />
        <StatTile label="Net of our fee" value={money(s.net)} hint="Before any invoices" />
      </div>

      <DataTable
        columns={[{ label: "Home", wrap: true }, { label: "Dates" }, { label: "Guest", wrap: true }, { label: "Source" }, { label: "Nights", align: "right" }, { label: "Gross", align: "right" }, { label: "Fee", align: "right" }, { label: "Net", align: "right" }, { label: "Payment" }]}
        empty="No stays checked in this month."
        rows={s.lines.map((l) => [
          l.propertyName, fmtRange(l.booking.checkIn, l.booking.checkOut), l.booking.guest, l.booking.source,
          l.nights, amount(l, l.gross), amount(l, l.fee), <span key="n" className="font-medium">{amount(l, l.net)}</span>,
          <span key="p" className="text-xs text-muted">{l.recorded ? "Recorded amounts" : paidBy(l.booking.source)}</span>,
        ])}
        footer={["Total", "", "", "", s.nights, money(s.gross), money(s.fee), money(s.net), ""]}
      />

      <div className="space-y-2 text-sm leading-relaxed text-muted">
        <p>
          Guests pay Airbnb or Vrbo when they book, and the platform pays you directly on its own payout schedule, under its payout rules and your Management Agreement. This statement is a record of the stays; no money is sent from this site.
        </p>
        {unrecorded > 0 && (
          <p>
            {unrecorded} {unrecorded === 1 ? "stay was" : "stays were"} imported from the platform calendar without amounts, so only the nights are shown. See your Airbnb or Vrbo earnings for those payouts.
          </p>
        )}
        <p>
          Cleaning fees on file ({money(s.cleaning)}) cover turnovers and are not part of your revenue or our fee. Lodging tax is collected and remitted separately.
        </p>
      </div>
    </>
  );
}
