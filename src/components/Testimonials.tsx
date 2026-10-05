import { testimonials } from "@/lib/testimonials";

// Owner reviews band. One review reads as a large pull quote; several become a grid.
export default function Testimonials({ rating }: { rating?: { value: number; count: number; platform: string; home: string; href: string } }) {
  if (testimonials.length === 0) return null;
  const [lead, ...rest] = testimonials;
  return (
    <section className="bg-dusk text-cream" aria-labelledby="owners-say">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <p className="caps text-xs text-wave">From our owners</p>
        <h2 id="owners-say" className="display mt-2 max-w-3xl text-4xl sm:text-5xl">What owners say</h2>

        <figure className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <blockquote>
            <p className="display text-3xl leading-[1.15] text-white sm:text-5xl">&ldquo;{lead.headline}&rdquo;</p>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/85">{lead.body}</p>
          </blockquote>
          <figcaption className="border-t border-cream/25 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="ui text-base font-medium text-white">{lead.name}</p>
            <p className="ui mt-0.5 text-sm text-cream/70">{lead.role}</p>
            <p className="ui mt-4 text-sm text-wave" aria-label="Five stars">★★★★★</p>
          </figcaption>
        </figure>

        {rest.length > 0 && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {rest.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-cream/20 p-6">
                <blockquote className="leading-relaxed text-cream/90">&ldquo;{t.body}&rdquo;</blockquote>
                <figcaption className="ui mt-4 text-sm text-cream/70"><span className="font-medium text-white">{t.name}</span> · {t.role}</figcaption>
              </figure>
            ))}
          </div>
        )}

        {rating && (
          <p className="ui mt-14 border-t border-cream/20 pt-6 text-sm text-cream/80">
            Guests agree: <a href={rating.href} target="_blank" rel="noopener noreferrer" className="text-white underline decoration-wave underline-offset-4 hover:decoration-white">{rating.home} is rated ★ {rating.value.toFixed(2)} from {rating.count} reviews on {rating.platform}</a>.
          </p>
        )}
      </div>
    </section>
  );
}
