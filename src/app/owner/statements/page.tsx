import type { Metadata } from "next";
import Link from "next/link";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import { money } from "@/lib/data";
import { feeSentence, getOwnerData, loadOwner, monthTitle, statements } from "@/lib/owner";

export const metadata: Metadata = { title: "Statements" };

export default async function OwnerStatements() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const data = await getOwnerData(owner);
  const rows = statements(data, owner);
  const sum = (k: "gross" | "percentFee" | "fixedFee" | "cleaning" | "net" | "stays" | "nights") => rows.reduce((s, r) => s + r[k], 0);

  return (
    <>
      <PageHeader eyebrow="Monthly statements" title="Statements"
        intro={`One statement per month, built from your stays. A stay lands on the month it checks in. ${feeSentence(data, owner)}`} />
      <DataTable
        columns={[{ label: "Month" }, { label: "Stays", align: "right" }, { label: "Nights", align: "right" }, { label: "Gross", align: "right" }, { label: "% fee", align: "right" }, { label: "Fixed fee", align: "right" }, { label: "Cleaning", align: "right" }, { label: "Net", align: "right" }]}
        rows={rows.map((s) => [
          <Link key="m" href={`/owner/statements/${s.month}`} className="text-deep hover:underline">{monthTitle(s.month)}</Link>,
          s.stays, s.nights, money(s.gross), money(s.percentFee), money(s.fixedFee), money(s.cleaning), <span key="n" className="font-medium">{money(s.net)}</span>,
        ])}
        footer={["Last 12 months", sum("stays"), sum("nights"), money(sum("gross")), money(sum("percentFee")), money(sum("fixedFee")), money(sum("cleaning")), money(sum("net"))]}
      />
      <p className="ui text-xs leading-relaxed text-muted">
        Guests pay Airbnb or Vrbo, and the platform pays you on its payout schedule under your Management Agreement. Gross, % fee and net appear only for stays with money on file; net is gross less our % fee and fixed fee. Stays imported from the platform calendar have no amounts on file, but the fixed fee and cleaning fee still apply to each one. Cleaning covers the turnover and is not taken from net. Open a month to see each stay and print or save it as a PDF.
      </p>
    </>
  );
}
