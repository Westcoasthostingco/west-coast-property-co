import type { Metadata } from "next";
import { DataTable, PageHeader, Pill } from "@/components/admin/ui";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

type Message = { id: string; created_at: string; name: string; email: string; kind: string | null; message: string; emailed: boolean; email_error: string | null };

// Contact form submissions. Every message is saved here before the site tries
// to email it, so nothing is lost if email isn't set up or fails.
export default async function AdminMessages() {
  await requireRole("admin"); // pages must not rely on the layout for auth
  let messages: Message[] = [];
  let loadError = "";
  if (supabaseAdminConfigured) {
    const { data, error } = await supabaseAdmin().from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) loadError = error.message;
    messages = (data as Message[]) ?? [];
  }
  const notEmailed = messages.filter((m) => !m.emailed).length;
  const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
  return (
    <>
      <PageHeader eyebrow="Contact form" title="Messages"
        intro={`${messages.length} messages${notEmailed ? ` · ${notEmailed} not emailed (check /api/health for email setup)` : ""}`} />
      {loadError && <p className="ui text-sm text-charcoal">Couldn&apos;t load messages: {loadError}</p>}
      <DataTable head={["Received", "From", "About", "Message", "Email"]} empty="No messages yet."
        rows={messages.map((m) => [
          <span key="w" className="whitespace-nowrap">{when(m.created_at)}</span>,
          <span key="f" className="block"><span className="block">{m.name}</span><a href={`mailto:${m.email}`} className="text-xs text-deep hover:underline">{m.email}</a></span>,
          m.kind ?? "",
          <span key="m" className="block max-w-md whitespace-pre-wrap text-sm leading-snug">{m.message}</span>,
          <span key="e" title={m.email_error ?? undefined}><Pill value={m.emailed ? "sent" : "not sent"} /></span>,
        ])} />
    </>
  );
}
