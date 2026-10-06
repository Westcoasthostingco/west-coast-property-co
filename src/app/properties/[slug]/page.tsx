import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyImage, { coverPhoto } from "@/components/PropertyImage";
import PhotoGallery from "@/components/PhotoGallery";
import Amenities from "@/components/Amenities";
import BookOn, { hasBookingLink } from "@/components/BookOn";
import JsonLd from "@/components/seo/JsonLd";
import { getProperty, getProperties, getPublishedReviews } from "@/lib/data";
import { propertyDescription, propertyPhoto, vacationRentalJsonLd } from "@/lib/seo";
import { getListingContent, type ListingPhoto } from "@/lib/listing-content";

// Each home's page is its own microsite: a showcase of the home with links to
// book it on Airbnb or Vrbo. The site itself takes no bookings or payments.

// Pre-render known homes at build time. If the database can't be reached during
// the build, return none: pages then render on first request instead of failing
// the whole deployment.
export async function generateStaticParams() {
  try {
    return (await getProperties()).map((p) => ({ slug: p.slug }));
  } catch (e) {
    console.warn("generateStaticParams: could not load properties, rendering on demand", e);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const p = await getProperty((await params).slug);
  if (!p) return { title: "Home", robots: { index: false } };
  const title = `${p.name}: ${p.bedrooms}-bedroom vacation rental in ${p.city}, WA`;
  const description = propertyDescription(p);
  const path = `/properties/${p.slug}`;
  const photo = propertyPhoto(p.slug);
  const images = photo ? [{ url: photo, width: 1200, height: 900, alt: `${p.name}, ${p.city}, Washington` }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: `${p.name} | West Coast Hosting Co`, description, ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title: `${p.name} | West Coast Hosting Co`, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}

function platformNames(p: { airbnbUrl?: string | null; vrboUrl?: string | null }) {
  const names = [p.airbnbUrl && "Airbnb", p.vrboUrl && "Vrbo"].filter(Boolean) as string[];
  return names.length ? names.join(" or ") : "us";
}

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();
  const reviews = await getPublishedReviews(p.id);
  const where = platformNames(p);
  const petsWelcome = p.amenities.some((a) => /pet/i.test(a));
  const c = getListingContent(p.slug);
  const rating = c?.listingRating;

  const sections = [
    ["overview", "Overview"],
    ["gallery", "Photos"],
    ...(c?.sleeping.length ? [["sleeping", "Sleeping"]] : []),
    ["amenities", "Amenities"],
    ["details", "Good to know"],
    ...(c ? [["location", "Location"]] : []),
    ...(reviews.length ? [["reviews", "Reviews"]] : []),
  ];

  return (
    <main className="pb-28 sm:pb-0">
      <JsonLd data={vacationRentalJsonLd(p)} />

      {/* Hero */}
      <section className="relative isolate flex min-h-[72vh] items-end overflow-hidden" aria-label={p.name}>
        <PropertyImage slug={p.slug} name={`${p.name}, ${p.city}, Washington`} priority sizes="100vw" className="absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/25 to-ink/10" aria-hidden="true" />
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-32 sm:px-6 sm:pb-16">
          <p className="caps text-xs text-wave">{p.city}, Washington</p>
          <h1 className="display mt-3 max-w-3xl text-5xl leading-[1.05] text-white sm:text-7xl">{p.name}</h1>
          <p className="ui mt-4 text-sm text-white/85">
            {p.bedrooms} bedrooms · {p.bathrooms} baths · sleeps {p.guests}
            {rating ? <> · ★ {rating.value.toFixed(2)} from {rating.count} reviews on {rating.platform}</> : p.reviewCount > 0 && <> · ★ {p.rating.toFixed(1)} from {p.reviewCount} reviews</>}
          </p>
          <BookOn p={p} size="lg" tone="dark" className="mt-8" />
          <p className="ui mt-3 text-xs text-white/70">You book with the host on {where}, where prices, house rules and payment are handled.</p>
        </div>
      </section>

      {/* Section menu */}
      <nav aria-label={`${p.name} sections`} className="sticky top-[78px] z-10 border-b border-line bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 sm:px-6">
          <ul className="caps-tight flex shrink-0 gap-5 py-3.5 text-[0.65rem] text-charcoal/80">
            {sections.map(([id, label]) => <li key={id}><a href={`#${id}`} className="whitespace-nowrap hover:text-deep">{label}</a></li>)}
          </ul>
          {p.airbnbUrl && (
            <a href={p.airbnbUrl} target="_blank" rel="noopener noreferrer" className="ui ml-auto hidden shrink-0 rounded-full bg-deep px-4 py-1.5 text-xs font-medium text-white hover:bg-dusk md:inline-flex">
              Book on Airbnb ↗
            </a>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Overview */}
        <section id="overview" className="scroll-mt-32 grid gap-10 py-14 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="caps text-xs text-deep">The home</p>
            <p className="mt-4 max-w-2xl text-xl leading-relaxed text-charcoal">{p.summary}</p>
            {c && (
              <div className="mt-6 max-w-2xl space-y-4 leading-relaxed text-charcoal/90">
                {c.about.map((para) => <p key={para.slice(0, 32)}>{para}</p>)}
              </div>
            )}
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Listed on {where}. The host, house rules, and cancellation policy are on the listing, and the host looks after your stay from booking to check-out.
            </p>
          </div>
          <aside className="rounded-2xl border border-line bg-white p-6">
            <dl className="ui grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
              <div><dt className="caps-tight text-[0.6rem] text-muted">Bedrooms</dt><dd className="mt-1 text-lg text-charcoal">{p.bedrooms}</dd></div>
              <div><dt className="caps-tight text-[0.6rem] text-muted">Baths</dt><dd className="mt-1 text-lg text-charcoal">{p.bathrooms}</dd></div>
              <div><dt className="caps-tight text-[0.6rem] text-muted">Sleeps</dt><dd className="mt-1 text-lg text-charcoal">{p.guests}</dd></div>
              <div><dt className="caps-tight text-[0.6rem] text-muted">Minimum stay</dt><dd className="mt-1 text-lg text-charcoal">{nightsLabel(p.minNights ?? 2)}</dd></div>
            </dl>
            <BookOn p={p} className="mt-6" />
          </aside>
        </section>

        {/* Highlights */}
        {c && c.highlights.length > 0 && (
          <section aria-label="Highlights" className="pb-14">
            <ul className="grid gap-4 sm:grid-cols-3">
              {c.highlights.map((h) => (
                <li key={h.title} className="rounded-2xl bg-mist p-6">
                  <p className="display text-xl text-deep">{h.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{h.body}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Photos */}
        <section id="gallery" className="scroll-mt-32 pb-14">
          <h2 className="caps text-xs text-deep">Photos</h2>
          {c ? (
            <PhotoGallery
              name={p.name}
              cover={{ src: coverPhoto(p.slug), node: <PropertyImage slug={p.slug} name={`${p.name}, ${p.city}, Washington`} sizes="(min-width: 640px) 50vw, 100vw" className="h-full w-full transition group-hover/ph:scale-[1.02]" /> }}
              photos={c.photos}
              featured={c.featured}
              groups={groupByRoom(c.photos)}
            />
          ) : (
            <div className="mt-5 grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
              <PropertyImage slug={p.slug} name={`${p.name}, ${p.city}, Washington`} sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
              {[1, 2, 3, 4].map((i) => <PropertyImage key={i} slug={p.slug} name={`${p.name} ${i}`} crop={i} sizes="(min-width: 640px) 25vw, 100vw" className="hidden aspect-[4/3] sm:block" />)}
            </div>
          )}
        </section>

        {/* Where you'll sleep */}
        {c && c.sleeping.length > 0 && (
          <section id="sleeping" className="scroll-mt-32 pb-14">
            <h2 className="caps text-xs text-deep">Where you&apos;ll sleep</h2>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {c.sleeping.map((b) => (
                <li key={b.room} className="rounded-2xl border border-line bg-white p-5">
                  <p className="display text-xl text-charcoal">{b.room}</p>
                  <p className="ui mt-1 text-sm text-muted">{b.beds}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Amenities */}
        <section id="amenities" className="scroll-mt-32 pb-14">
          <h2 className="caps text-xs text-deep">Amenities</h2>
          {c ? (
            <Amenities groups={c.amenityGroups} notIncluded={c.notIncluded} />
          ) : (
            <ul className="ui mt-5 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-3">
              {p.amenities.map((a) => <li key={a} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-wave" />{a}</li>)}
            </ul>
          )}
        </section>

        {/* Good to know */}
        <section id="details" className="scroll-mt-32 pb-14">
          <h2 className="caps text-xs text-deep">Good to know</h2>
          <dl className="ui mt-5 grid gap-3 text-sm sm:grid-cols-2">
            {(c
              ? [
                  ...c.rules.map((r) => splitRule(r.title, r.detail)),
                  ...c.safety.map((x) => ["Safety", x]),
                  ["Booking and cancellation", `Through ${where}, under the listing's policy`],
                ]
              : [
                  ["Check-in", "Usually after 3:00 pm"], ["Check-out", "Usually by 11:00 am"],
                  ["Minimum stay", nightsLabel(p.minNights ?? 2)], ["Sleeps", `${p.guests} guests`],
                  ["Pets", petsWelcome ? "Listed as welcome, see house rules" : "See the listing's house rules"], ["Booking and cancellation", `Through ${where}, under the listing's policy`],
                ]
            ).map(([k, v], i) => (
              <div key={`${k}-${i}`} className="flex justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
          <p className="ui mt-3 text-xs text-muted">
            The listing on {where} is what counts: it has the current house rules, check-in times, and cancellation policy, and the host sends the exact address with your booking. See <Link href="/legal/policies" className="text-deep underline">how booking works</Link>.
          </p>
        </section>

        {/* Location */}
        {c && (
          <section id="location" className="scroll-mt-32 pb-14">
            <h2 className="caps text-xs text-deep">Location</h2>
            <div className="mt-5 grid gap-8 md:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="display text-3xl text-charcoal">{c.locationLabel}</p>
                {c.locationSummary && <p className="mt-3 max-w-xl leading-relaxed text-muted">{c.locationSummary}</p>}
                <p className="ui mt-4 text-xs text-muted">The host shares the exact address after you book.</p>
              </div>
              {c.nearby.length > 0 && (
                <dl className="ui grid gap-2 text-sm">
                  {c.nearby.map((n) => (
                    <div key={n.place} className="flex justify-between gap-4 border-b border-line pb-2"><dt>{n.place}</dt><dd className="text-muted">{n.distance}</dd></div>
                  ))}
                </dl>
              )}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section id="reviews" className="scroll-mt-32 pb-14">
            <h2 className="caps text-xs text-deep">Guest reviews</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <blockquote key={r.id} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-deep">{"★".repeat(r.rating)}</p>
                  <p className="mt-2 leading-relaxed">{r.body}</p>
                  <footer className="ui mt-3 text-xs text-muted">{r.guest}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Closing link to the listing */}
      <section className="bg-dusk text-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="caps text-xs text-wave">Stay at {p.name}</p>
            <h2 className="display mt-2 text-4xl">Pick your dates on {where}.</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-cream/80">You&apos;ll see live prices, the house rules, and the cancellation policy, and book securely with the host on the platform.</p>
          </div>
          <BookOn p={p} size="lg" tone="dark" />
        </div>
      </section>

      {/* Phone: always-visible booking bar */}
      {hasBookingLink(p) && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur sm:hidden">
          <BookOn p={p} className="[&>a]:flex-1" />
        </div>
      )}
    </main>
  );
}

// "Check-in after 3:00 PM" -> ["Check-in", "After 3:00 PM"]; "10 guests maximum" -> ["Guests", "10 maximum"].
function splitRule(title: string, detail?: string): [string, string] {
  if (detail) return [title, detail];
  const m = title.match(/^(Check-in|Checkout|Check-out)\s+(.*)$/i);
  if (m) return [m[1] === "Checkout" ? "Check-out" : m[1], m[2].charAt(0).toUpperCase() + m[2].slice(1)];
  const g = title.match(/^(\d+) guests maximum$/);
  if (g) return ["Guests", `${g[1]} maximum`];
  return ["House rule", title];
}

function groupByRoom(photos: ListingPhoto[]): [string, ListingPhoto[]][] {
  const groups = new Map<string, ListingPhoto[]>();
  for (const ph of photos) groups.set(ph.room, [...(groups.get(ph.room) ?? []), ph]);
  return [...groups.entries()];
}


const nightsLabel = (n: number) => `${n} ${n === 1 ? "night" : "nights"}`;
