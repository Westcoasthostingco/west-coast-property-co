import { notFound } from "next/navigation";
import { getProperty, getProperties, getPublishedReviews, money } from "@/lib/data";

export async function generateStaticParams() {
  return (await getProperties()).map((p) => ({ slug: p.slug }));
}

export default async function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();
  const reviews = await getPublishedReviews(p.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex h-64 items-end rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white/80">
        Photo gallery goes here
      </div>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-3xl font-semibold">{p.name}</h1>
          <p className="mt-1 text-muted">{p.city}, {p.region} · {p.bedrooms} bd · {p.bathrooms} ba · sleeps {p.guests}</p>
          <p className="mt-4">{p.summary}</p>
          <h2 className="mt-8 font-semibold">Amenities</h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {p.amenities.map((a) => <li key={a} className="rounded-full border border-line bg-white px-3 py-1">{a}</li>)}
          </ul>
          <h2 className="mt-8 font-semibold">Reviews ★ {p.rating} ({p.reviewCount})</h2>
          <div className="mt-2 space-y-3">
            {reviews.map((r) => (
              <blockquote key={r.id} className="rounded-xl border border-line bg-white p-4 text-sm">
                {"★".repeat(r.rating)} <p className="mt-1">{r.body}</p><footer className="mt-1 text-muted">{r.guest}</footer>
              </blockquote>
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-white p-5">
          <p className="text-2xl font-semibold">{money(p.nightlyRate)} <span className="text-sm font-normal text-muted">/ night</span></p>
          <p className="text-sm text-muted">+ {money(p.cleaningFee)} cleaning fee</p>
          <div className="mt-4 space-y-2 text-sm">
            <label className="block">Check-in<input type="date" className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
            <label className="block">Check-out<input type="date" className="mt-1 w-full rounded-lg border border-line px-3 py-2" /></label>
          </div>
          <button type="button" className="mt-4 w-full rounded-full bg-accent py-2.5 font-medium text-white">Check availability</button>
          <p className="mt-2 text-xs text-muted">TODO: availability calendar + Stripe Checkout.</p>
        </aside>
      </div>
    </main>
  );
}
