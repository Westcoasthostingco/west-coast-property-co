import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  const field = "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2";
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Contact us</h1>
      <p className="mt-2 text-sm text-muted">Form submission is not wired up yet (TODO: server action + Resend + Turnstile).</p>
      <form className="mt-6 space-y-4">
        <label className="block text-sm">Name<input name="name" className={field} /></label>
        <label className="block text-sm">Email<input name="email" type="email" className={field} /></label>
        <label className="block text-sm">Message<textarea name="message" rows={5} className={field} /></label>
        <button type="button" className="rounded-full bg-brand px-6 py-2.5 text-white">Send</button>
      </form>
    </main>
  );
}
