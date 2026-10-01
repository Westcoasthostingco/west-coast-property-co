import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AlmostThere from "@/components/owner/AlmostThere";
import Card from "@/components/owner/Card";
import DataTable from "@/components/owner/DataTable";
import PageHeader from "@/components/owner/PageHeader";
import Pill, { invoiceTone } from "@/components/owner/Pill";
import { money } from "@/lib/data";
import { fmtDate, getInvoice, loadOwner } from "@/lib/owner";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Invoice ${id.toUpperCase()}` };
}

const long: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };

export default async function OwnerInvoice({ params }: Props) {
  const { id } = await params;
  const owner = await loadOwner();
  if (!owner) return <AlmostThere />;
  const invoice = await getInvoice(owner.id, id);
  if (!invoice) notFound();

  return (
    <>
      <PageHeader eyebrow="Invoice" title={invoice.id.toUpperCase()}
        intro={`Issued ${fmtDate(invoice.issuedOn, long)}, due ${fmtDate(invoice.dueOn, long)}.`}
        actions={<Link href="/owner/invoices" className="caps-tight rounded-full border border-line px-4 py-2 text-[0.65rem] text-muted transition hover:border-teal hover:text-teal">All invoices</Link>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <DataTable
          columns={[{ label: "Description" }, { label: "Qty", align: "right" }, { label: "Unit", align: "right" }, { label: "Amount", align: "right" }]}
          rows={invoice.lineItems.map((l) => [l.description, l.qty, money(l.unit), money(l.qty * l.unit)])}
          footer={["Total", "", "", money(invoice.total)]}
        />
        <Card title="Status">
          <div className="flex items-baseline justify-between">
            <p className="display text-4xl not-italic text-charcoal">{money(invoice.total)}</p>
            <Pill tone={invoiceTone(invoice.status)}>{invoice.status}</Pill>
          </div>
          <button type="button" disabled aria-describedby="pay-hint"
            className="caps-tight mt-4 w-full cursor-not-allowed rounded-full bg-teal/40 px-5 py-2 text-[0.7rem] text-white">
            Pay
          </button>
          <p id="pay-hint" className="ui mt-2 text-xs leading-relaxed text-muted">
            Pay online coming soon; this amount nets against your next payout.
          </p>
          {invoice.note && <p className="mt-3 text-sm text-charcoal">{invoice.note}</p>}
        </Card>
      </div>
    </>
  );
}
