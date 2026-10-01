import Stat from "@/components/Stat";
import { getBookings, getOwners, getPayouts, getAllProperties, getReviews, money } from "@/lib/data";

export default async function AdminHome() {
  const [props, bookings, owners, payouts, reviews] = await Promise.all([
    getAllProperties(), getBookings(), getOwners(), getPayouts(), getReviews(),
  ]);
  const revenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.total, 0);
  const fees = payouts.reduce((s, x) => s + x.fee, 0);
  return (
    <>
      <h1 className="text-3xl font-semibold">Admin overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Properties" value={props.length} />
        <Stat label="Owners" value={owners.length} />
        <Stat label="Bookings" value={bookings.length} />
        <Stat label="Booking volume" value={money(revenue)} />
        <Stat label="Management fees" value={money(fees)} />
        <Stat label="Reviews to moderate" value={reviews.filter((r) => r.status === "pending").length} />
      </div>
    </>
  );
}
