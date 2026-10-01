import type { Metadata } from "next";
import Stat from "@/components/Stat";
import Table from "@/components/Table";
import { requireRole } from "@/lib/auth";
import { getOwnerDashboard, getOwnerForClerkUser, money, nameMap } from "@/lib/data";

export const metadata: Metadata = { title: "Owner portal" };

export default async function OwnerPortal() {
  const { userId } = await requireRole("owner");
  const owner = await getOwnerForClerkUser(userId);

  if (!owner) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Almost there</h1>
        <p className="mt-2 text-muted">Your login is not linked to an owner record yet. The team will finish that for you.</p>
      </main>
    );
  }

  const { properties, bookings, payouts } = await getOwnerDashboard(owner);
  const propertyName = nameMap(properties);
  const paid = payouts.filter((x) => x.status === "paid").reduce((s, x) => s + x.net, 0);
  const pending = payouts.filter((x) => x.status === "scheduled").reduce((s, x) => s + x.net, 0);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Welcome, {owner.name}</h1>
        {!owner.payoutsReady && (
          <form action="/api/stripe/connect/onboard" method="post" className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
            <span>Payouts are not set up yet. Add your bank details with Stripe to receive your share of each booking.</span>
            <button type="submit" className="rounded-full bg-brand px-4 py-1.5 text-white">Set up payouts</button>
          </form>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Properties" value={properties.length} />
        <Stat label="Paid out" value={money(paid)} />
        <Stat label="Scheduled payouts" value={money(pending)} />
      </div>
      <section>
        <h2 className="mb-2 font-semibold">Bookings</h2>
        <Table head={["Property", "Guest", "Dates", "Source", "Status", "Total"]}
          rows={bookings.map((b) => [propertyName(b.propertyId), b.guest, `${b.checkIn} to ${b.checkOut}`, b.source, b.status, money(b.total)])} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Payout statements</h2>
        <Table head={["Booking", "Gross", "Mgmt fee", "Net to you", "Release", "Status"]}
          rows={payouts.map((x) => [x.bookingId.slice(0, 8), money(x.gross), money(x.fee), money(x.net), x.releaseOn, x.status])} />
      </section>
    </main>
  );
}
