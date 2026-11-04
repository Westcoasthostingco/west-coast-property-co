import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { billing, cohostPlan, goodToKnow, launchPlans, setupFeeWaiver, whichFits, type Plan } from "@/lib/pricing";

const description =
  "Short-term and mid-term rental launch packages from $495 and co-hosting from 15% of booking revenue, from West Coast Hosting Co in Gig Harbor, Washington.";
export const metadata: Metadata = {
  title: "Services & Pricing",
  description,
  alternates: { canonical: "/services" },
  openGraph: { type: "website", url: "/services", title: "Services & Pricing | West Coast Hosting Co", description },
  twitter: { card: "summary_large_image", title: "Services & Pricing | West Coast Hosting Co", description },
};

function PlanCard({ p }: { p: Plan }) {
  const dark = p.feature;
  return (
    <article className={`flex flex-col overflow-hidden rounded-3xl border ${dark ? "border-deep" : "border-line bg-white"} shadow-lg shadow-teal/10`}>
      <div className={`px-7 py-7 text-center ${dark ? "bg-deep text-white" : "bg-mist"}`}>
        {p.ribbon && <span className="caps-tight mb-3 inline-block rounded-full border border-current px-3 py-1 text-[0.6rem]">{p.ribbon}</span>}
        <p className={`caps text-xs ${dark ? "text-wave" : "text-deep"}`}>{p.name}</p>
        <p className="display mt-2 text-5xl">
          {p.from && <span className="ui mr-1 align-middle text-xs uppercase tracking-wider">from</span>}
          {p.price}
        </p>
        <p className={`mt-1 ${dark ? "text-white/85" : "text-muted"}`}>{p.unit}</p>
        {p.fee && <p className={`caps-tight mt-3 text-[0.65rem] ${dark ? "text-white/85" : "text-charcoal"}`}>{p.fee}</p>}
      </div>
      <div className="flex flex-1 flex-col gap-4 bg-white px-7 py-7">
        <p className="display text-lg text-deep">{p.fit}</p>
        <ul className="space-y-2 text-[0.95rem] leading-snug text-charcoal">
          {p.features.map((f) => (
            <li key={f} className="flex gap-3"><span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-wave" />{f}</li>
          ))}
        </ul>
        {p.onboarding && (
          <div>
            <p className="caps-tight text-[0.6rem] text-deep">Onboarding includes</p>
            <ul className="mt-2 space-y-2 text-[0.95rem] leading-snug text-charcoal">
              {p.onboarding.map((f) => (
                <li key={f} className="flex gap-3"><span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-wave" />{f}</li>
              ))}
            </ul>
          </div>
        )}
        {p.billedSeparately && (
          <div>
            <p className="caps-tight text-[0.6rem] text-deep">Billed separately</p>
            <ul className="mt-2 space-y-2 text-[0.95rem] leading-snug text-muted">
              {p.billedSeparately.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Services() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-20 sm:px-6">
        <p className="caps text-xs text-deep">For homeowners</p>
        <h1 className="display mt-2 text-5xl text-deep sm:text-6xl">Services &amp; Pricing</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">Whether you rent to vacation guests or to mid-term guests staying a month or more, and whether you want a little guidance getting started or a home that is fully managed, we have a clear option for you. You always keep ownership of your listing, your reviews, and your payouts.</p>
      </section>

      <section className="bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Monthly, on completed stays" title="Property management" intro="Two local, five-star rated co-hosts with decades of sales and real estate experience, managing your home month to month." />
          <article className="mt-12 overflow-hidden rounded-3xl border border-deep bg-white shadow-lg shadow-teal/10">
            <div className="grid gap-8 bg-deep px-7 py-9 text-white md:grid-cols-[1fr_1.2fr] md:items-center sm:px-10">
              <div>
                <p className="caps text-xs text-wave">{cohostPlan.name}</p>
                <p className="display mt-2 text-6xl">{cohostPlan.price}</p>
                <p className="mt-1 text-white/85">{cohostPlan.unit}</p>
              </div>
              <p className="display text-2xl leading-snug">{cohostPlan.fit}</p>
            </div>
            <div className="px-7 py-9 sm:px-10">
              <p className="caps-tight text-[0.65rem] text-deep">Management includes</p>
              <ul className="mt-4 grid gap-x-10 gap-y-2 text-[0.95rem] leading-snug text-charcoal md:grid-cols-2">
                {cohostPlan.features.map((f) => <li key={f} className="flex gap-3"><span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-wave" />{f}</li>)}
              </ul>
              <p className="caps-tight mt-10 text-[0.65rem] text-deep">Pick your starting point</p>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                {cohostPlan.starts.map((o) => (
                  <div key={o.label} className="rounded-2xl border border-line bg-mist p-6">
                    <p className="caps text-xs text-deep">{o.label}</p>
                    <p className="display mt-2 text-4xl text-charcoal">{o.fee} <span className="ui align-middle text-xs uppercase tracking-wider text-muted">{o.feeUnit}</span></p>
                    <p className="display mt-3 text-lg text-deep">{o.fit}</p>
                    <ul className="mt-4 space-y-2 text-[0.95rem] leading-snug text-charcoal">
                      {o.includes.map((f) => <li key={f} className="flex gap-3"><span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-wave" />{f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Getting started · one-time fee" title="Launch your rental" intro="For homeowners who want help getting their home on Airbnb and Vrbo. Pay once, with no ongoing commitment." />
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          {launchPlans.map((p) => <PlanCard key={p.name} p={p} />)}
        </div>
        <p className="mt-8 rounded-2xl border border-dashed border-wave bg-mist px-6 py-5 leading-relaxed"><strong className="text-deep">Ready for ongoing help?</strong> {setupFeeWaiver}</p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Not sure where to start?" title="Which option fits" />
        <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-white">
          <table className="w-full text-left">
            <thead className="bg-mist">
              <tr className="caps-tight text-[0.65rem] text-deep"><th className="px-6 py-4 font-medium">If you…</th><th className="px-6 py-4 font-medium">Choose</th></tr>
            </thead>
            <tbody>
              {whichFits.map(([need, plan]) => (
                <tr key={plan} className="border-t border-line align-top">
                  <td className="px-6 py-4 leading-snug">{need}</td>
                  <td className="display px-6 py-4 text-lg text-deep sm:whitespace-nowrap">{plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          {([["How billing works", billing], ["Good to know", goodToKnow]] as const).map(([title, items]) => (
            <div key={title}>
              <h2 className="caps border-b border-line pb-2 text-xs text-deep">{title}</h2>
              <ul className="mt-4 space-y-3 leading-relaxed text-charcoal">
                {items.map((t) => <li key={t} className="flex gap-3"><span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-wave" />{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-deep text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-4 py-16 sm:px-6">
          <div>
            <h2 className="display text-4xl">Let&apos;s talk about your home</h2>
            <p className="mt-3 max-w-xl text-white/85">Tell us a little about it and we&apos;ll help you pick the right option.</p>
            <Link href="/contact" className="ui mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-deep transition hover:bg-mist">Tell us about your home</Link>
          </div>
          <div className="ui grid gap-6 sm:grid-cols-2">
            <div><p className="text-sm text-white/70">Christi Young</p><a href="tel:+12532786818" className="text-xl font-medium hover:text-wave">253.278.6818</a></div>
            <div><p className="text-sm text-white/70">Melissa Heckman</p><a href="tel:+15038608115" className="text-xl font-medium hover:text-wave">503.860.8115</a></div>
          </div>
        </div>
      </section>
    </main>
  );
}
