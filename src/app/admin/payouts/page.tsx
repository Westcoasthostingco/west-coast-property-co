import Table from "@/components/Table";
import { getPayouts, money, ownerName } from "@/lib/data";

export default async function AdminPayouts() {
  const payouts = await getPayouts();
  return (
    <>
      <h1 className="text-3xl font-semibold">Payouts</h1>
      <p className="text-sm text-muted">Pass-through: guest payments are transferred to each owner&apos;s Stripe Connect account after check-in.</p>
      <Table head={["Owner", "Booking", "Gross", "Fee", "Net", "Release on", "Status"]}
        rows={payouts.map((x) => [ownerName(x.ownerId), x.bookingId, money(x.gross), money(x.fee), money(x.net), x.releaseOn, x.status])} />
    </>
  );
}
