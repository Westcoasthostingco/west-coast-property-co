import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import PropertyImage from "@/components/PropertyImage";
import { getProperty, getProperties, getPublishedReviews, getUnavailableDates, money } from "@/lib/data";

export async function generateStaticParams() {
  return (await getProperties()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const p = await getProperty((await params).slug);
  return { title: p?.name ?? "Home", description: p?.summary };
}

const input = "ui mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm";

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();
  const [reviews, taken] = await Promise.all([getPublishedReviews(p.id), getUnavailableDates(p.id)]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      {/* Gallery: one large, four small (lightbox comes with real photos) */}
      <div className="grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        <PropertyImage slug={p.slug} name={p.name} className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
        {[1, 2, 3, 4].map((i) => <PropertyImage key={i} slug={p.slug} name={`${p.name} ${i}`} crop={i} className="hidden aspect-[4/3] sm:block" />)}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="caps text-xs text-sky">{p.city}, {p.region}</p>
          <h1 className="display mt-2 text-5xl text-charcoal">{p.name}</h1>
          <p className="ui mt-3 text-sm text-muted">{p.bedrooms} bedrooms · {p.bathrooms} baths · sleeps {p.guests}{p.reviewCount > 0 && <> · ★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)</>}</p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">{p.summary}</p>

          <h2 className="caps mt-12 text-xs text-sky">Amenities</h2>
          <ul className="ui mt-4 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
            {p.amenities.map((a) => <li key={a} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-wave" />{a}</li>)}
          </ul>

          <h2 className="caps mt-12 text-xs text-sky">Availability</h2>
          <div className="mt-4"><AvailabilityCalendar stays={taken} minNights={2} /></div>

          <h2 className="caps mt-12 text-xs text-sky">Where you&apos;ll be</h2>
          <div className="mt-4 flex aspect-[2/1] items-center justify-center rounded-2xl bg-mist text-sm text-muted">Map of {p.city} (Mapbox, step 3)</div>

          {reviews.length > 0 && (
            <>
              <h2 className="caps mt-12 text-xs text-sky">Guest reviews</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {reviews.map((r) => (
                  <blockquote key={r.id} className="rounded-2xl border border-line bg-white p-5">
                    <p className="text-sky">{"★".repeat(r.rating)}</p>
                    <p className="mt-2 leading-relaxed">{r.body}</p>
                    <footer className="ui mt-3 text-xs text-muted">{r.guest}</footer>
                  </blockquote>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sticky booking panel */}
        <aside className="h-fit rounded-3xl border border-line bg-white p-6 shadow-lg shadow-teal/10 lg:sticky lg:top-24">
          <p className="display text-3xl text-charcoal">{money(p.nightlyRate)} <span className="ui text-sm not-italic text-muted">/ night</span></p>
          <p className="ui mt-1 text-xs text-muted">+ {money(p.cleaningFee)} cleaning · lodging tax at checkout</p>
          <form action="/api/checkout" method="post" className="mt-5 space-y-3 text-sm">
            <input type="hidden" name="slug" value={p.slug} />
            <div className="grid grid-cols-2 gap-3">
              <label className="caps-tight text-[0.6rem] text-sky">Check in<input required name="check_in" type="date" className={input} /></label>
              <label className="caps-tight text-[0.6rem] text-sky">Check out<input required name="check_out" type="date" className={input} /></label>
            </div>
            <label className="caps-tight block text-[0.6rem] text-sky">Guests<input required name="guests" type="number" min={1} max={p.guests} defaultValue={2} className={input} /></label>
            <label className="caps-tight block text-[0.6rem] text-sky">Name<input required name="guest_name" className={input} /></label>
            <label className="caps-tight block text-[0.6rem] text-sky">Email<input required name="guest_email" type="email" className={input} /></label>
            <button type="submit" className="caps-tight mt-2 w-full rounded-full bg-teal py-3 text-[0.7rem] text-white transition hover:bg-teal-dark">Book and pay</button>
            <p className="text-center text-xs text-muted">Secure payment by Stripe. You&apos;ll hear from Christi or Melissa before you arrive.</p>
          </form>
          {p.airbnbUrl && (
            <p className="ui mt-4 border-t border-line pt-4 text-center text-xs text-muted">
              Prefer Airbnb? <a href={p.airbnbUrl} target="_blank" rel="noopener" className="text-teal underline">See this home on Airbnb</a>
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
