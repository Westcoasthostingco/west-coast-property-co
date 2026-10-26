import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { guestReviews } from "@/lib/guest-reviews";

// Guest reviews, after the owner quote. One review reads as a single wide card,
// two sit side by side, three or more fill a three-column grid.
export default function GuestReviews() {
  if (guestReviews.length === 0) return null;
  const n = guestReviews.length;
  const cols = n === 1 ? "max-w-3xl" : n === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6" aria-label="Guest reviews">
      <SectionHeading eyebrow="From our guests" title="Guests love it here" />
      <div className={`mt-12 grid gap-6 ${cols}`}>
        {guestReviews.map((r) => (
          <figure key={`${r.name}-${r.date}`} className="flex flex-col rounded-3xl bg-mist p-8 sm:p-10">
            <span className="tracking-[0.2em] text-sm text-deep" role="img" aria-label="Five stars">★★★★★</span>
            <p className="display mt-4 text-2xl leading-snug text-charcoal sm:text-3xl">&ldquo;{r.headline}&rdquo;</p>
            <blockquote className="mt-4 flex-1 leading-relaxed text-muted">{r.body}</blockquote>
            <figcaption className="ui mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-t border-line pt-6">
              <div>
                <p className="text-base font-medium text-charcoal">{r.name}{r.from && <span className="font-normal text-muted">, {r.from}</span>}</p>
                <p className="text-sm text-muted">Stayed at <Link href={`/properties/${r.slug}`} className="text-deep hover:underline">{r.home}</Link></p>
              </div>
              <p className="text-sm text-muted">{r.platform} · {r.date}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
