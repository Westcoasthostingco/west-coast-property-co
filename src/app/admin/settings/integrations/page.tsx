import type { Metadata } from "next";
import Link from "next/link";
import { Card, DataTable, PageHeader, Pill } from "@/components/admin/ui";
import { getAllProperties, nameMap } from "@/lib/data";
import { fmtDateTime, getAllIcalFeeds, integrationStatuses, sourceLabel } from "@/lib/admin";
import { supabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "Integrations" };

export default async function Integrations() {
  const [props, feeds] = await Promise.all([getAllProperties(), getAllIcalFeeds()]);
  const propertyName = nameMap(props);
  const statuses = integrationStatuses();
  const ready = statuses.filter((s) => s.configured).length;
  return (
    <>
      <PageHeader eyebrow="Settings" title="Integrations" intro={`${ready} of ${statuses.length} configured. Keys are read from environment variables and never shown here.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statuses.map((s) => (
          <Card key={s.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="ui text-base font-medium text-charcoal">{s.name}</h2>
                <p className="ui text-xs text-muted">{s.purpose}</p>
              </div>
              <Pill value={s.configured ? "configured" : "missing"} />
            </div>
            <ul className="ui mt-3 space-y-1 text-xs">
              {s.vars.map((v) => (
                <li key={v.name} className="flex items-center justify-between gap-2">
                  <code className="truncate text-charcoal">{v.name}</code>
                  <span className={v.present ? "text-deep" : "text-[#b6633a]"}>{v.present ? "set" : "not set"}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="caps-tight text-[0.68rem] text-deep">iCal feeds</h2>
          <p className="ui text-xs text-muted">Edit URLs on each home&apos;s page. Synced hourly by cron.</p>
        </div>
        {!supabaseConfigured && <p className="ui text-xs text-muted">Sample mode: feeds are stored in Supabase, so none are listed.</p>}
        <DataTable head={["Home", "Channel", "Last sync", "Last error", "Export feed"]} empty="No channel feeds yet."
          rows={feeds.map((f) => [
            <Link key="p" href={`/admin/properties/${f.propertyId}`} className="font-medium text-charcoal hover:text-deep">{propertyName(f.propertyId)}</Link>,
            sourceLabel[f.source] ?? f.source,
            f.lastSyncedAt ? fmtDateTime(f.lastSyncedAt) : <span className="text-muted">never</span>,
            f.lastError ? <span className="text-xs text-[#b6633a]">{f.lastError}</span> : "—",
            <code key="e" className="text-xs text-muted">/api/ical/{props.find((p) => p.id === f.propertyId)?.slug ?? f.propertyId}</code>,
          ])} />
      </section>
    </>
  );
}
