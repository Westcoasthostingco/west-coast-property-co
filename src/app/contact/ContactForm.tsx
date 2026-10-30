"use client";
import { useActionState } from "react";
import { sendContact, type ContactState } from "./actions";

const field = "ui mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm";
const label = "caps-tight block text-[0.6rem] text-deep";

export default function ContactForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  if (state.ok && !state.error) {
    return <div className="rounded-3xl border border-line bg-white p-8"><p className="display text-3xl text-deep">Got it.</p><p className="mt-2 text-muted">We&apos;ll reply by email soon.</p></div>;
  }
  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-8 shadow-lg shadow-teal/10">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Name<input required name="name" className={field} /></label>
        <label className={label}>Email<input required name="email" type="email" className={field} /></label>
        <label className={label}>Phone (optional)<input name="phone" type="tel" autoComplete="tel" className={field} /></label>
        <label className={label}>Where is your home?<input name="location" placeholder="e.g. Gig Harbor" className={field} /></label>
      </div>
      <label className={`${label} mt-4`}>I&apos;m looking for
        <select name="kind" className={field}>
          <option>help listing my home</option>
          <option>a co-host for my rental</option>
          <option>help with a mid-term rental (30+ nights)</option>
          <option>not sure yet</option>
          <option>something else</option>
        </select>
      </label>
      <label className={`${label} mt-4`}>Tell us about your home<textarea required name="message" rows={6} placeholder="Bedrooms, whether it's rented now, and anything else we should know." className={field} /></label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {turnstileSiteKey && <div className="cf-turnstile mt-4" data-sitekey={turnstileSiteKey} />}
      {state.error && <p className="ui mt-4 text-sm text-charcoal">{state.error}</p>}
      <button type="submit" disabled={pending} className="caps-tight mt-6 rounded-full bg-deep px-6 py-3 text-[0.7rem] text-white hover:bg-dusk disabled:opacity-60">{pending ? "Sending" : "Send"}</button>
    </form>
  );
}
