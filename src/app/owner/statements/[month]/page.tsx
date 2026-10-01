import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatTile from "@/components/StatTile";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import Pill, { payoutTone } from "@/components/owner/Pill";
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
  const transfer = (l: (typeof s.lines)[number]) =>
    l.payout ? (
      <span className="inline-flex items-center gap-2">
        <Pill tone={payoutTone(l.payout.status)}>{l.payout.status}</Pill>
        <span className="text-xs text-muted">{l.payout.stripeTransferId ?? (l.payout.status === "paid" ? "" : fmtDate(l.payout.releaseOn))}</span>
      </span>
    ) : <Pill>no payout yet</Pill>;

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
        intro={`Prepared for ${owner.name}. Stays are listed by check-in date. Our fee is ${owner.feePercent}% of the nights subtotal.`}
        actions={<>
          <Link href="/owner/statements" className="caps-tight rounded-full border border-line px-4 py-2 text-[0.65rem] text-muted transition hover:border-deep hover:text-deep">All statements</Link>
          <PrintButton />
        </>} />

      <div className="hidden print:block">
        <p className="caps text-xs">West Coast Hosting Co</p>
        <p className="ui mt-1 text-xs">Owner statement for {owner.name} ({owner.email}). Generated {fmtDate(new Date().toISOString().slice(0, 10), { month: "long", day: "numeric", year: "numeric" })}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Nights revenue" value={money(s.gross)} hint={`${s.stays} ${s.stays === 1 ? "stay" : "stays"}`} />
        <StatTile label="Management fee" value={money(s.fee)} hint={`${owner.feePercent}% of nights`} />
        <StatTile label="Cleaning passed through" value={money(s.cleaning)} hint="Not owner revenue" />
        <StatTile label="Net to you" value={money(s.net)} hint="Before any invoices netted" />
      </div>

      <DataTable
        columns={[{ label: "Home" }, { label: "Dates" }, { label: "Guest" }, { label: "Source" }, { label: "Nights", align: "right" }, { label: "Gross", align: "right" }, { label: "Fee", align: "right" }, { label: "Net", align: "right" }, { label: "Transfer" }]}
        empty="No stays checked in this month."
        rows={s.lines.map((l) => [
          l.propertyName, fmtRange(l.booking.checkIn, l.booking.checkOut), l.booking.guest, l.booking.source,
          l.nights, money(l.gross), money(l.fee), <span key="n" className="font-medium">{money(l.net)}</span>, transfer(l),
        ])}
        footer={["Total", "", "", "", s.lines.reduce((n, l) => n + l.nights, 0), money(s.gross), money(s.fee), money(s.net), ""]}
      />

      <p className="text-sm leading-relaxed text-muted">
        Cleaning fees of {money(s.cleaning)} were collected from guests and passed through to cover turnovers; they are not part of your revenue or our fee.
        Lodging tax is collected from guests and remitted separately. Repairs and supplies we invoice are netted against your next payout and will show here as a line once that ships.
      </p>
    </>
  );
}
