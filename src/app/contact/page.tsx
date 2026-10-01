import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

const field = "ui mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm";
const label = "caps-tight block text-[0.6rem] text-sky";

export default function Contact() {
  return (
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
      {/* TODO: server action + Resend + Turnstile (build step 3) */}
      <form className="rounded-3xl border border-line bg-white p-8 shadow-lg shadow-teal/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>Name<input name="name" className={field} /></label>
          <label className={label}>Email<input name="email" type="email" className={field} /></label>
        </div>
        <label className={`${label} mt-4`}>I&apos;m a
          <select name="kind" className={field}>
            <option>guest planning a stay</option>
            <option>homeowner interested in management</option>
            <option>something else</option>
          </select>
        </label>
        <label className={`${label} mt-4`}>Message<textarea name="message" rows={6} className={field} /></label>
        <button type="button" className="caps-tight mt-6 rounded-full bg-teal px-6 py-3 text-[0.7rem] text-white hover:bg-teal-dark">Send</button>
      </form>
    </main>
  );
}
