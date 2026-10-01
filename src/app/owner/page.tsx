import type { Metadata } from "next";
import Stat from "@/components/Stat";
import Table from "@/components/Table";
import { getBookings, getPayouts, getProperties, money, propertyName } from "@/lib/data";

export const metadata: Metadata = { title: "Owner portal" };

// Demo: shows owner "o1". In production, scope by the Clerk user -> owners row
// and rely on Supabase RLS so owners only ever see their own data.
const OWNER_ID = "o1";

export default async function OwnerPortal() {
  const props = (await getProperties()).filter((p) => p.ownerId === OWNER_ID);
  const ids = new Set(props.map((p) => p.id));
  const bookings = (await getBookings()).filter((b) => ids.has(b.propertyId));
  const payouts = (await getPayouts()).filter((x) => x.ownerId === OWNER_ID);
  const paid = payouts.filter((x) => x.status === "paid").reduce((s, x) => s + x.net, 0);
  const pending = payouts.filter((x) => x.status === "scheduled").reduce((s, x) => s + x.net, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Owner portal</h1>
        <p className="text-sm text-muted">Demo data. Sign-in (Clerk) is not wired up yet.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Properties" value={props.length} />
        <Stat label="Paid out" value={money(paid)} />
        <Stat label="Scheduled payouts" value={money(pending)} />
      </div>
      <section>
        <h2 className="mb-2 font-semibold">Upcoming bookings</h2>
        <Table head={["Property", "Guest", "Dates", "Source", "Status", "Total"]}
          rows={bookings.map((b) => [propertyName(b.propertyId), b.guest, `${b.checkIn} to ${b.checkOut}`, b.source, b.status, money(b.total)])} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Payout statements</h2>
        <Table head={["Booking", "Gross", "Mgmt fee", "Net to you", "Release", "Status"]}
          rows={payouts.map((x) => [x.bookingId, money(x.gross), money(x.fee), money(x.net), x.releaseOn, x.status])} />
      </section>
    </main>
  );
}
