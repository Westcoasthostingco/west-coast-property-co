import type { Metadata } from "next";
import Script from "next/script";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Own a home in the Puget Sound region? Contact West Coast Hosting Co in Gig Harbor about listing it as a short-term or mid-term rental or hiring a co-host.", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <>
    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
    <main className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="caps text-xs text-deep">Contact</p>
        <h1 className="display mt-2 text-5xl text-deep">Let&apos;s talk about your home.</h1>
        <p className="mt-6 text-lg leading-relaxed">Thinking about listing your home as a short-term or mid-term rental, or looking for a co-host for one you already rent? Tell us a little about it, and Christi or Melissa will get back to you.</p>
        <div className="mt-8 space-y-2 text-lg">
          <a href="mailto:hello@westcoasthostingco.com" className="block text-deep hover:underline">hello@westcoasthostingco.com</a>
          <a href="tel:+12532786818" className="block">253.278.6818</a>
          <a href="tel:+15038608115" className="block">503.860.8115</a>
          <p className="caps mt-4 text-xs text-muted">Gig Harbor, Washington</p>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-sm leading-relaxed text-muted">Staying in one of our homes? For anything about a reservation, check-in, or your stay, message your host through Airbnb or Vrbo. That&apos;s the fastest way to reach them.</p>
      </div>
      <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
    </main>
    </>
  );
}
