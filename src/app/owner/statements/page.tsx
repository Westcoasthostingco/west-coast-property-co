import type { Metadata } from "next";
import Link from "next/link";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import { money } from "@/lib/data";
import { getOwnerData, loadOwner, monthTitle, statements } from "@/lib/owner";

export const metadata: Metadata = { title: "Statements" };

export default async function OwnerStatements() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const data = await getOwnerData(owner);
  const rows = statements(data, owner);
  const sum = (k: "gross" | "fee" | "cleaning" | "net" | "stays") => rows.reduce((s, r) => s + r[k], 0);

  return (
    <>
      <PageHeader eyebrow="Monthly statements" title="Statements"
        intro={`One statement per month. A stay lands on the month it checks in, which is when its payout releases. Our fee is ${owner.feePercent}% of the nights subtotal; cleaning fees pass straight through to cover the turnover.`} />
      <DataTable
        columns={[{ label: "Month" }, { label: "Stays", align: "right" }, { label: "Nights revenue", align: "right" }, { label: "Management fee", align: "right" }, { label: "Cleaning passed through", align: "right" }, { label: "Net to you", align: "right" }]}
        rows={rows.map((s) => [
          <Link key="m" href={`/owner/statements/${s.month}`} className="text-deep hover:underline">{monthTitle(s.month)}</Link>,
          s.stays, money(s.gross), money(s.fee), money(s.cleaning), <span key="n" className="font-medium">{money(s.net)}</span>,
        ])}
        footer={["Last 12 months", sum("stays"), money(sum("gross")), money(sum("fee")), money(sum("cleaning")), money(sum("net"))]}
      />
      <p className="ui text-xs text-muted">Open a month to see each stay and print or save it as a PDF.</p>
    </>
  );
}
