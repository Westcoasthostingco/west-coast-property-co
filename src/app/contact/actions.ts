"use server";
import { contactNotification, sendEmail } from "@/lib/email";

export type ContactState = { ok?: boolean; error?: string };

async function verifyTurnstile(token: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet: allow
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ secret, response: token }),
  });
  return (await res.json()).success === true;
}

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const kind = String(form.get("kind") ?? "");
  const message = String(form.get("message") ?? "").trim();
  if (String(form.get("website") ?? "")) return { ok: true }; // honeypot
  if (!name || !email.includes("@") || message.length < 5) return { error: "Add your name, a real email, and a message." };
  if (!(await verifyTurnstile(form.get("cf-turnstile-response") as string | null))) return { error: "Spam check failed. Try again." };
  try {
    const r = await sendEmail(process.env.CONTACT_TO ?? "hello@westcoasthostingco.com", `Website: ${name} (${kind})`, contactNotification({ name, email, kind, message }), email);
    return { ok: true, ...("skipped" in (r as object) ? { error: "Email is not configured yet, but your message was received in sample mode." } : {}) };
  } catch (e) {
    return { error: `Could not send: ${(e as Error).message}` };
  }
}
