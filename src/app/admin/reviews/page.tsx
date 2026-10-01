import Table from "@/components/Table";
import { getReviews, propertyName } from "@/lib/data";

export default async function AdminReviews() {
  const reviews = await getReviews();
  return (
    <>
      <h1 className="text-3xl font-semibold">Reviews</h1>
      <Table head={["Property", "Guest", "Rating", "Review", "Status"]}
        rows={reviews.map((r) => [propertyName(r.propertyId), r.guest, r.rating, r.body, r.status])} />
    </>
  );
}
