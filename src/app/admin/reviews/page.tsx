import type { Metadata } from "next";
import { DataTable, Notice, PageHeader, Pill, buttonClass, ghostButtonClass } from "@/components/admin/ui";
import { setReviewPublishedAction } from "@/app/admin/actions";
import { getAllProperties, getReviews, nameMap } from "@/lib/data";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviews({ searchParams }: PageProps<"/admin/reviews">) {
  const sp = await searchParams;
  const [reviews, props] = await Promise.all([getReviews(), getAllProperties()]);
  const propertyName = nameMap(props);
  const pending = reviews.filter((r) => r.status === "pending").length;
  return (
    <>
      <PageHeader eyebrow="Moderation" title="Reviews" intro={`${reviews.length} reviews · ${pending} waiting`} />
      <Notice searchParams={sp} />
      <DataTable head={["Home", "Guest", "Rating", "Review", "Status", ""]} empty="No reviews yet."
        rows={[...reviews].sort((a, b) => (a.status === b.status ? 0 : a.status === "pending" ? -1 : 1)).map((r) => [
          propertyName(r.propertyId), r.guest,
          <span key="r" className="text-deep" aria-label={`${r.rating} of 5`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></span>,
          <span key="b" className="block max-w-md whitespace-normal text-sm leading-snug">{r.body}</span>,
          <Pill key="s" value={r.status} />,
          <form key="a" action={setReviewPublishedAction.bind(null, r.id, r.status !== "published")}>
            <button type="submit" className={`${r.status === "published" ? ghostButtonClass : buttonClass} px-3 py-1 text-xs`}>{r.status === "published" ? "Unpublish" : "Publish"}</button>
          </form>,
        ])} />
    </>
  );
}
