import type { Metadata } from "next";
import { Card, Field, Notice, PageHeader, buttonClass, inputClass } from "@/components/admin/ui";
import { createBookingAction } from "@/app/admin/actions";
import { getAllProperties, money } from "@/lib/data";
import { BOOKING_SOURCES, sourceLabel, todayISO } from "@/lib/admin";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Manual booking" };

export default async function NewBooking({ searchParams }: PageProps<"/admin/bookings/new">) {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const sp = await searchParams;
  const props = await getAllProperties();
  const preset = typeof sp.property === "string" ? sp.property : "";
  return (
    <>
      <PageHeader eyebrow="Bookings" title="Manual booking" intro="Phone bookings, repeat guests paying offline, and owner stays. Saved as confirmed; a turnover is scheduled on the check-out day." />
      <Notice searchParams={sp} />
      <form action={createBookingAction} className="space-y-4">
        <Card title="Stay">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Home">
              <select name="propertyId" required defaultValue={preset} className={inputClass}>
                <option value="" disabled>Choose a home</option>
                {props.map((p) => <option key={p.id} value={p.id}>{p.name} · {money(p.nightlyRate)}/night</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select name="source" defaultValue="manual" className={inputClass}>
                {BOOKING_SOURCES.filter((s) => s !== "direct").map((s) => <option key={s} value={s}>{sourceLabel[s]}</option>)}
              </select>
            </Field>
            <Field label="Check-in"><input type="date" name="checkIn" required min={todayISO()} className={inputClass} /></Field>
            <Field label="Check-out"><input type="date" name="checkOut" required className={inputClass} /></Field>
            <Field label="Nightly rate ($)" hint="Blank uses the home's rate; owner stays are always $0"><input type="number" name="nightlyRate" min={0} step={1} className={inputClass} /></Field>
            <Field label="Guests"><input type="number" name="guestCount" min={1} defaultValue={2} className={inputClass} /></Field>
          </div>
        </Card>
        <Card title="Guest">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name"><input name="guest" required className={inputClass} /></Field>
            <Field label="Email"><input name="guestEmail" type="email" className={inputClass} /></Field>
            <Field label="Phone"><input name="guestPhone" type="tel" className={inputClass} /></Field>
            <Field label="Notes" className="sm:col-span-3"><textarea name="notes" rows={2} placeholder="Paid by check, arriving late, bringing a dog…" className={inputClass} /></Field>
          </div>
        </Card>
        <div className="flex items-center justify-between gap-4">
          <p className="ui text-xs text-muted">Overlapping dates are rejected by the database, so double bookings cannot be saved.</p>
          <button type="submit" className={buttonClass}>Add booking</button>
        </div>
      </form>
    </>
  );
}
