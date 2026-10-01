import type { Metadata } from "next";
import Script from "next/script";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  return (
    <>
    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
    <main className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="caps text-xs text-sky">Contact</p>
        <h1 className="display mt-2 text-5xl text-teal">Say hello.</h1>
        <p className="mt-6 text-lg leading-relaxed">Planning a stay, or wondering what co-hosting would look like for your home? We answer our own phones.</p>
        <div className="mt-8 space-y-2 text-lg">
          <a href="mailto:hello@westcoasthostingco.com" className="block text-teal hover:underline">hello@westcoasthostingco.com</a>
          <a href="tel:+12532786818" className="block">253.278.6818</a>
          <a href="tel:+15038608115" className="block">503.860.8115</a>
          <p className="caps mt-4 text-xs text-muted">Gig Harbor, Washington</p>
        </div>
      </div>
      <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
    </main>
    </>
  );
}
