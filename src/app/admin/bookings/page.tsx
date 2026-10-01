import Table from "@/components/Table";
import { getBookings, money, propertyName } from "@/lib/data";

export default async function AdminBookings() {
  const bookings = await getBookings();
  return (
    <>
      <h1 className="text-3xl font-semibold">Bookings</h1>
      <Table head={["Property", "Guest", "Check-in", "Check-out", "Source", "Status", "Total"]}
        rows={bookings.map((b) => [propertyName(b.propertyId), b.guest, b.checkIn, b.checkOut, b.source, b.status, money(b.total)])} />
    </>
  );
}
