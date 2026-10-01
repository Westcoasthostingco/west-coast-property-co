import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import { Card, Field, Notice, PageHeader, Pill, buttonClass, dangerButtonClass, inputClass } from "@/components/admin/ui";
import { deletePhotoAction, savePropertyAction, uploadPhotoAction } from "@/app/admin/actions";
import { getOwners, money } from "@/lib/data";
import { getCleaners } from "@/lib/cleaning";
import { getPropertyDetail } from "@/lib/admin";
import { supabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = { title: "Edit property" };

export default async function EditProperty({ params, searchParams }: PageProps<"/admin/properties/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [p, owners, cleaners] = await Promise.all([getPropertyDetail(id), getOwners(), getCleaners()]);
  if (!p) notFound();
  return (
    <>
      <PageHeader eyebrow={`${p.city}, ${p.region}`} title={p.name}
        intro={`${money(p.nightlyRate)}/night · sleeps ${p.guests} · ${p.reviewCount ? `${p.rating.toFixed(1)} from ${p.reviewCount} reviews` : "no reviews yet"}`}
        actions={
          <>
            <Pill value={p.published ? "published" : "pending"} />
            <Link href={`/properties/${p.slug}`} className="ui text-sm text-teal hover:underline" target="_blank">View listing ↗</Link>
            <Link href={`/admin/calendar`} className="ui text-sm text-teal hover:underline">Calendar</Link>
          </>
        } />
      <Notice searchParams={sp} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PropertyForm property={p} owners={owners} cleaners={cleaners} action={savePropertyAction.bind(null, p.id)} />

        <div className="space-y-4">
          <Card title="Photos">
            {p.photos.length === 0 && <p className="ui text-sm text-muted">No photos yet. The listing shows a placeholder tint until the first upload.</p>}
            <ul className="grid grid-cols-2 gap-2">
              {p.photos.map((ph) => (
                <li key={ph.id} className="group relative overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Storage URL; next/image needs a configured host */}
                  <img src={ph.url} alt={ph.alt ?? p.name} className="aspect-[4/3] w-full object-cover" />
                  <form action={deletePhotoAction.bind(null, p.id, ph.id)} className="absolute right-1 top-1">
                    <button type="submit" aria-label="Remove photo" className="ui rounded-full bg-white/90 px-2 py-0.5 text-[0.65rem] text-charcoal opacity-0 transition group-hover:opacity-100 focus:opacity-100">Remove</button>
                  </form>
                </li>
              ))}
            </ul>
            <form action={uploadPhotoAction.bind(null, p.id)} className="mt-3 space-y-3" encType="multipart/form-data">
              <Field label="Add a photo" hint={supabaseConfigured ? "JPG or PNG, under 1 MB each (see deployer notes to raise)" : "Sample mode: uploads are disabled"}>
                <input type="file" name="photo" accept="image/*" required className="ui block w-full text-sm text-charcoal file:mr-3 file:rounded-full file:border-0 file:bg-mist file:px-3 file:py-1.5 file:text-xs file:text-teal-dark" />
              </Field>
              <Field label="Alt text"><input name="alt" placeholder="Living room with harbor view" className={inputClass} /></Field>
              <button type="submit" className={buttonClass} disabled={!supabaseConfigured}>Upload</button>
            </form>
          </Card>

          <Card title="Quick facts">
            <dl className="ui grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Slug</dt><dd className="truncate">{p.slug}</dd>
              <dt className="text-muted">Tax</dt><dd>{(p.taxRateBps / 100).toFixed(2)}%</dd>
              <dt className="text-muted">Fee</dt><dd>{p.feePercentOverride != null ? `${p.feePercentOverride}% (override)` : `${owners.find((o) => o.id === p.ownerId)?.feePercent ?? "—"}% (owner)`}</dd>
              <dt className="text-muted">Min nights</dt><dd>{p.minNights}</dd>
              <dt className="text-muted">Door code</dt><dd>{p.doorCode ? "set" : <span className="text-muted">not set</span>}</dd>
              <dt className="text-muted">Default cleaner</dt><dd>{cleaners.find((c) => c.id === p.defaultCleanerId)?.name ?? <span className="text-muted">none</span>}</dd>
              <dt className="text-muted">iCal feeds</dt><dd>{p.icalFeeds.length || <span className="text-muted">none</span>}</dd>
            </dl>
          </Card>

          <Card title="Danger zone">
            <p className="ui text-xs text-muted">Homes are never deleted here because bookings and payouts reference them. Unpublish instead.</p>
            <p className={`${dangerButtonClass} mt-3 cursor-not-allowed opacity-60`}>Delete is disabled</p>
          </Card>
        </div>
      </div>
    </>
  );
}
