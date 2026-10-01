import Table from "@/components/Table";
import { getOwners } from "@/lib/data";

export default async function AdminOwners() {
  const owners = await getOwners();
  return (
    <>
      <h1 className="text-3xl font-semibold">Owners</h1>
      <Table head={["Name", "Email", "Fee", "Stripe payouts"]}
        rows={owners.map((o) => [o.name, o.email, `${o.feePercent}%`, o.payoutsReady ? "Ready" : "Onboarding needed"])} />
    </>
  );
}
