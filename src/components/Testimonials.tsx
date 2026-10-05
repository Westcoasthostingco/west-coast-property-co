import Image from "next/image";
import { testimonials, type Testimonial } from "@/lib/testimonials";

type Rating = { value: number; count: number; platform: string; home: string; href: string };

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function Stars({ className = "" }: { className?: string }) {
  return <span className={`tracking-[0.2em] ${className}`} role="img" aria-label="Five stars">★★★★★</span>;
}

function Person({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-center gap-4">
      <span aria-hidden="true" className="ui flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wave/25 text-sm font-medium tracking-wider text-white ring-1 ring-wave/50">{initials(t.name)}</span>
      <div>
        <p className="ui text-base font-medium text-white">{t.name}</p>
        <p className="ui text-sm text-cream/70">{t.role}</p>
      </div>
      <Stars className="ml-auto text-sm text-wave" />
    </div>
  );
}

// Owner reviews: a photo of the water on one side, the quote on the other. One review
// reads as a feature; more become a row of cards underneath.
export default function Testimonials({ rating, photo }: { rating?: Rating; photo?: { src: string; alt: string } }) {
  if (testimonials.length === 0) return null;
  const [lead, ...rest] = testimonials;
  return (
    <section className="relative isolate overflow-hidden bg-dusk text-cream" aria-labelledby="owners-say">
      {/* soft light from the water side */}
      <div aria-hidden="true" className="absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-deep/40 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
        <div className={`grid items-center gap-12 lg:gap-16 ${photo ? "lg:grid-cols-[0.85fr_1.15fr]" : ""}`}>
          {photo && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-ink/30 lg:aspect-[4/5]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              {rating && (
                <a href={rating.href} target="_blank" rel="noopener noreferrer"
                  className="ui absolute inset-x-4 bottom-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-cream/95 px-5 py-4 text-charcoal backdrop-blur transition hover:bg-white">
                  <span className="display text-4xl leading-none text-deep">{rating.value.toFixed(2)}</span>
                  <span className="flex flex-col text-xs leading-snug">
                    <Stars className="text-sm text-deep" />
                    <span className="text-muted">{rating.count} guest reviews on {rating.platform} ↗</span>
                  </span>
                </a>
              )}
            </div>
          )}

          <figure>
            <p className="caps text-xs text-wave">From our owners</p>
            <h2 id="owners-say" className="sr-only">What owners say</h2>
            <span aria-hidden="true" className="display -mb-10 mt-2 block text-[8rem] leading-none text-wave/35 sm:-mb-16 sm:text-[10rem]">&ldquo;</span>
            <blockquote>
              <p className="display text-3xl leading-[1.15] text-white sm:text-[2.6rem]">{lead.headline}</p>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">{lead.body}</p>
            </blockquote>
            <figcaption className="mt-10 max-w-xl border-t border-cream/20 pt-6"><Person t={lead} /></figcaption>
          </figure>
        </div>

        {rest.length > 0 && (
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {rest.map((t) => (
              <figure key={t.name} className="rounded-3xl border border-cream/15 bg-cream/[0.04] p-8">
                <p className="display text-2xl leading-snug text-white">&ldquo;{t.headline}&rdquo;</p>
                <blockquote className="mt-4 leading-relaxed text-cream/85">{t.body}</blockquote>
                <figcaption className="mt-6"><Person t={t} /></figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
