import { Card, Field, buttonClass, inputClass } from "@/components/admin/ui";
import { ICAL_SOURCES, sourceLabel, type PropertyDetail } from "@/lib/admin";
import type { Owner } from "@/lib/data";
import type { Cleaner } from "@/lib/cleaning";

type Props = { property?: PropertyDetail; owners: Owner[]; cleaners: Cleaner[]; action: (fd: FormData) => Promise<void> };

// Server component: plain HTML form posting to a server action. Works without JS.
export default function PropertyForm({ property: p, owners, cleaners, action }: Props) {
  const feed = (s: string) => p?.icalFeeds.find((f) => f.source === s);
  return (
    <form action={action} className="space-y-4">
      <Card title="Listing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input name="name" required defaultValue={p?.name} className={inputClass} /></Field>
          <Field label="Slug" hint="Public URL: /properties/slug"><input name="slug" defaultValue={p?.slug} placeholder="auto from name" className={inputClass} /></Field>
          <Field label="Owner">
            <select name="ownerId" required defaultValue={p?.ownerId ?? ""} className={inputClass}>
              <option value="" disabled>Choose an owner</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <Field label="Address"><input name="address" defaultValue={p?.address} className={inputClass} /></Field>
          <Field label="City"><input name="city" defaultValue={p?.city} className={inputClass} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Region"><input name="region" defaultValue={p?.region ?? "WA"} className={inputClass} /></Field>
            <Field label="Postal code"><input name="postalCode" defaultValue={p?.postalCode} className={inputClass} /></Field>
          </div>
          <Field label="Summary" hint="One or two sentences for cards" className="sm:col-span-2"><textarea name="summary" rows={2} defaultValue={p?.summary} className={inputClass} /></Field>
          <Field label="Airbnb listing URL" hint="Public listing page, linked from the property page" className="sm:col-span-2"><input name="airbnb_url" type="url" defaultValue={p?.airbnbUrl ?? ""} className={inputClass} /></Field>
          <Field label="Description" className="sm:col-span-2"><textarea name="description" rows={5} defaultValue={p?.description} className={inputClass} /></Field>
          <Field label="Amenities" hint="Comma separated" className="sm:col-span-2"><input name="amenities" defaultValue={p?.amenities.join(", ")} className={inputClass} /></Field>
          <label className="ui flex items-center gap-2 text-sm text-charcoal">
            <input type="checkbox" name="published" defaultChecked={p?.published ?? false} className="h-4 w-4 accent-[#2f6f86]" /> Published on the public site
          </label>
        </div>
      </Card>

      <Card title="Capacity and pricing">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Bedrooms"><input name="bedrooms" type="number" min={0} defaultValue={p?.bedrooms} className={inputClass} /></Field>
          <Field label="Bathrooms"><input name="bathrooms" type="number" min={0} step={0.5} defaultValue={p?.bathrooms} className={inputClass} /></Field>
          <Field label="Max guests"><input name="maxGuests" type="number" min={1} defaultValue={p?.guests ?? 2} className={inputClass} /></Field>
          <Field label="Minimum nights"><input name="minNights" type="number" min={1} defaultValue={p?.minNights ?? 2} className={inputClass} /></Field>
          <Field label="Nightly rate ($)"><input name="nightlyRate" type="number" min={0} step={1} required defaultValue={p?.nightlyRate} className={inputClass} /></Field>
          <Field label="Cleaning fee ($)"><input name="cleaningFee" type="number" min={0} step={1} defaultValue={p?.cleaningFee ?? 0} className={inputClass} /></Field>
          <Field label="Lodging tax (%)" hint="e.g. 10.50; saved as basis points"><input name="taxRatePercent" type="number" min={0} max={100} step={0.01} inputMode="decimal" defaultValue={p ? (p.taxRateBps / 100).toFixed(2) : "0.00"} className={inputClass} /></Field>
          <Field label="Fee override (%)" hint="Blank uses the owner's rate"><input name="feePercentOverride" type="number" min={0} max={100} step={0.5} defaultValue={p?.feePercentOverride ?? ""} className={inputClass} /></Field>
        </div>
      </Card>

      <Card title="Channels and operations">
        <div className="grid gap-4 sm:grid-cols-2">
          {ICAL_SOURCES.map((s) => (
            <Field key={s} label={`${sourceLabel[s]} iCal URL`} hint={feed(s)?.lastSyncedAt ? `Last synced ${new Date(feed(s)!.lastSyncedAt!).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}` : feed(s)?.lastError ? `Last error: ${feed(s)!.lastError}` : "Not synced yet"} className="sm:col-span-2">
              <input name={`ical_${s}`} type="url" defaultValue={feed(s)?.url ?? ""} placeholder="https://…/calendar.ics" className={inputClass} />
            </Field>
          ))}
          <Field label="Manual door code" hint="Shown to cleaners on job day; guests 48h before arrival"><input name="doorCode" defaultValue={p?.doorCode} className={inputClass} autoComplete="off" /></Field>
          <Field label="Seam device id" hint="Leave blank until Seam is connected"><input name="seamDeviceId" defaultValue={p?.seamDeviceId} className={inputClass} /></Field>
          <Field label="Default cleaner">
            <select name="defaultCleanerId" defaultValue={p?.defaultCleanerId ?? ""} className={inputClass}>
              <option value="">None (assign each turnover by hand)</option>
              {cleaners.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Local conditions">
        <p className="ui mb-3 text-xs text-muted">Optional. Fill in whichever applies and the listing page shows a live tide or snow widget; leave blank to show neither.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NOAA tide station" hint="e.g. 9446484 Tacoma. Station id from tidesandcurrents.noaa.gov; waterfront homes only" className="sm:col-span-2">
            <input name="tideStationId" inputMode="numeric" pattern="[0-9]*" defaultValue={p?.tideStationId ?? ""} placeholder="9446484" className={inputClass} />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="caps-tight mb-2 block text-[0.62rem] text-muted">Mountain conditions</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Ski resort name" hint="e.g. White Pass"><input name="skiResortName" defaultValue={p?.skiResort?.name ?? ""} className={inputClass} /></Field>
              <Field label="Latitude" hint="Decimal degrees"><input name="skiLat" type="number" step="any" min={-90} max={90} inputMode="decimal" defaultValue={p?.skiResort?.lat ?? ""} placeholder="46.6367" className={inputClass} /></Field>
              <Field label="Longitude" hint="Decimal degrees, negative for west"><input name="skiLng" type="number" step="any" min={-180} max={180} inputMode="decimal" defaultValue={p?.skiResort?.lng ?? ""} placeholder="-121.3911" className={inputClass} /></Field>
            </div>
          </fieldset>
        </div>
      </Card>

      <div className="flex justify-end">
        <button type="submit" className={buttonClass}>{p ? "Save changes" : "Create home"}</button>
      </div>
    </form>
  );
}
