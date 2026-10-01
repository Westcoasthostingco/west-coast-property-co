import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import PropertyImage from "@/components/PropertyImage";
import JsonLd from "@/components/seo/JsonLd";
import BookingPanel from "./BookingPanel";
import { TideWidget, SnowWidget } from "@/components/widgets";
import { todayISO } from "@/lib/stripe";
import { getProperty, getProperties, getPublishedReviews, getUnavailableDates } from "@/lib/data";
import { propertyDescription, propertyPhoto, vacationRentalJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getProperties()).map((p) => ({ slug: p.slug }));
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

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();
  const [reviews, taken] = await Promise.all([getPublishedReviews(p.id), getUnavailableDates(p.id)]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
      <JsonLd data={vacationRentalJsonLd(p)} />
      {/* Live conditions above the photos: tide for waterfront homes, snow for mountain homes */}
      <TideWidget stationId={p.tideStationId} className="mb-6" />
      <SnowWidget resort={p.skiResort} className="mb-6" />
      {/* Gallery: one large, four small (lightbox comes with real photos) */}
      <div className="grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        <PropertyImage slug={p.slug} name={`${p.name}, ${p.city}, Washington`} priority sizes="(min-width: 640px) 50vw, 100vw" className="aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" />
        {[1, 2, 3, 4].map((i) => <PropertyImage key={i} slug={p.slug} name={`${p.name} ${i}`} crop={i} className="hidden aspect-[4/3] sm:block" />)}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="caps text-xs text-deep">{p.city}, {p.region}</p>
          <h1 className="display mt-2 text-5xl text-charcoal">{p.name}</h1>
          <p className="ui mt-3 text-sm text-muted">{p.bedrooms} bedrooms · {p.bathrooms} baths · sleeps {p.guests}{p.reviewCount > 0 && <> · ★ {p.rating.toFixed(1)} ({p.reviewCount} reviews)</>}</p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">{p.summary}</p>

          <h2 className="caps mt-12 text-xs text-deep">Amenities</h2>
          <ul className="ui mt-4 grid grid-cols-2 gap-y-2 text-sm sm:grid-cols-3">
            {p.amenities.map((a) => <li key={a} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-wave" />{a}</li>)}
          </ul>

          <h2 className="caps mt-12 text-xs text-deep">Availability</h2>
          <div className="mt-4"><AvailabilityCalendar stays={taken} minNights={p.minNights ?? 2} /></div>

          <h2 className="caps mt-12 text-xs text-deep">Good to know</h2>
          <dl className="ui mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ["Check-in", "After 4:00 pm"], ["Check-out", "By 11:00 am"],
              ["Minimum stay", `${p.minNights ?? 2} nights`], ["Sleeps", `${p.guests} guests`],
              ["Cancellation", "Free up to 14 days before check-in"], ["Pets", p.amenities.some((a) => /pet/i.test(a)) ? "Welcome, let us know when booking" : "Not at this home"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 rounded-xl border border-line bg-white px-4 py-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
            ))}
          </dl>
          <p className="ui mt-3 text-xs text-muted">Full details in our <a href="/legal/policies#cancellation" className="text-deep underline">booking policies</a> and <a href="/legal/terms#guests" className="text-deep underline">guest terms</a>. Exact address arrives with your confirmation.</p>

          {reviews.length > 0 && (
            <>
              <h2 className="caps mt-12 text-xs text-deep">Guest reviews</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {reviews.map((r) => (
                  <blockquote key={r.id} className="rounded-2xl border border-line bg-white p-5">
                    <p className="text-deep">{"★".repeat(r.rating)}</p>
                    <p className="mt-2 leading-relaxed">{r.body}</p>
                    <footer className="ui mt-3 text-xs text-muted">{r.guest}</footer>
                  </blockquote>
                ))}
              </div>
            </>
          )}
        </div>

        <BookingPanel p={p} today={todayISO()} minNights={p.minNights ?? 2} taxRateBps={p.taxRateBps ?? 1030} />
      </div>
    </main>
  );
}
