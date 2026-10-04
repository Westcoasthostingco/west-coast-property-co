import type { Metadata } from "next";
import Link from "next/link";
import AlmostThere from "@/components/owner/AlmostThere";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import Pill, { invoiceTone } from "@/components/owner/Pill";
import { money } from "@/lib/data";
import { fmtDate, getInvoices, loadOwner } from "@/lib/owner";

export const metadata: Metadata = { title: "Invoices" };

export default async function OwnerInvoices() {
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const invoices = await getInvoices(owner.id);
  const open = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.total, 0);

  return (
    <>
      <PageHeader eyebrow="From the management team" title="Invoices"
        intro="Repairs, supplies and extra services we take care of for your home, billed under your Management Agreement. You can see each one here." />
      <div className="rounded-2xl border border-wave bg-mist px-5 py-4 text-sm leading-relaxed text-charcoal">
        <span className="caps-tight mr-2 text-[0.6rem] text-deep">Open balance</span>
        <span className="ui font-medium">{money(open)}</span>
        <span className="text-muted"> is settled as set out in your Management Agreement. We include payment details with each invoice.</span>
      </div>
      <DataTable
        columns={[{ label: "Invoice" }, { label: "Issued" }, { label: "Due" }, { label: "Items", align: "right" }, { label: "Total", align: "right" }, { label: "Status" }]}
        empty="No invoices yet. When we handle a repair or restock for you, it will show up here."
        rows={invoices.map((i) => [
          <Link key="i" href={`/owner/invoices/${i.id}`} className="text-deep hover:underline">{i.id.toUpperCase()}</Link>,
          fmtDate(i.issuedOn, { month: "short", day: "numeric", year: "numeric" }),
          fmtDate(i.dueOn, { month: "short", day: "numeric", year: "numeric" }),
          i.lineItems.length, money(i.total),
          <Pill key="s" tone={invoiceTone(i.status)}>{i.status}</Pill>,
        ])}
      />
    </>
  );
}
