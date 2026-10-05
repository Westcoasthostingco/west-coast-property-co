"use server";
import { contactNotification, sendEmail } from "@/lib/email";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabase";

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
  // Save first so no message is ever lost, then try to email it to the team.
  let savedId: string | null = null;
  if (supabaseAdminConfigured) {
    try {
      const { data } = await supabaseAdmin().from("contact_messages").insert({ name, email, kind, message }).select("id").single();
      savedId = (data?.id as string) ?? null;
    } catch (e) {
      console.error("contact: could not save message", e);
    }
  }

  let emailed = false, emailError: string | null = null;
  try {
    const r = await sendEmail(process.env.CONTACT_TO ?? "hello@westcoasthostingco.com", `Website: ${name} (${kind})`, contactNotification({ name, email, kind, message }), email);
    if ("skipped" in (r as object)) emailError = "RESEND_API_KEY is not set";
    else emailed = true;
  } catch (e) {
    emailError = (e as Error).message;
    console.error("contact: email failed", emailError);
  }

  if (savedId) {
    try { await supabaseAdmin().from("contact_messages").update({ emailed, email_error: emailError }).eq("id", savedId); } catch {}
  }
  if (emailed || savedId) return { ok: true };
  return { error: "Your message couldn't be sent. Please email hello@westcoasthostingco.com or call 253.278.6818." };
}
