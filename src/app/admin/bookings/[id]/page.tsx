import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Card, Field, Notice, PageHeader, Pill, buttonClass, dangerButtonClass, ghostButtonClass, inputClass } from "@/components/admin/ui";
import { addNoteAction, cancelBookingAction } from "@/app/admin/actions";
import { getAllProperties, getFeeOverrides, getOwners, money } from "@/lib/data";
import { getAllJobs, getCleaners } from "@/lib/cleaning";
import { cleanerName, fmtDate, fmtDateTime, getBookingDetail, nightsBetween } from "@/lib/admin";
import { feeTerms, stayMoney } from "@/lib/metrics";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Booking" };

const Row = ({ k, v, strong = false }: { k: string; v: React.ReactNode; strong?: boolean }) => (
  <div className={`flex justify-between py-1.5 ${strong ? "border-t border-line pt-2 font-medium" : ""}`}><dt className="text-muted">{k}</dt><dd>{v}</dd></div>
);

export default async function BookingDetailPage({ params, searchParams }: PageProps<"/admin/bookings/[id]">) {
  await requireRole("admin"); // S1: pages must not rely on the layout for auth
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [b, props, owners, feeOverrides, jobs, cleaners] = await Promise.all([getBookingDetail(id), getAllProperties(), getOwners(), getFeeOverrides(), getAllJobs(), getCleaners()]);
  if (!b) notFound();
  const property = props.find((p) => p.id === b.propertyId);
  const owner = owners.find((o) => o.id === property?.ownerId);
  // Informational fee split (shared math); the platform pays the owner, not this site.
  const split = stayMoney(b, feeTerms(owner, feeOverrides[b.propertyId], property));
  const job = jobs.find((j) => j.bookingId === b.id);
  const nights = nightsBetween(b.checkIn, b.checkOut);
  const subtotal = b.subtotal ?? Math.max(0, b.total - b.cleaningFee - b.tax);
  const active = b.status === "confirmed" || b.status === "pending";

  return (
    <>
      <PageHeader eyebrow={property?.name ?? "Booking"} title={b.guest}
        intro={`${fmtDate(b.checkIn, { weekday: "short", month: "short", day: "numeric" })} → ${fmtDate(b.checkOut, { weekday: "short", month: "short", day: "numeric", year: "numeric" })} · ${nights} night${nights === 1 ? "" : "s"} · ${b.source}`}
        actions={<><Pill value={b.status} /><Link href="/admin/bookings" className="ui text-sm text-deep hover:underline">All bookings</Link></>} />
      <Notice searchParams={sp} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Guest">
          <dl className="ui space-y-1 text-sm">
            <div><dt className="text-muted">Name</dt><dd className="font-medium">{b.guest}</dd></div>
            <div><dt className="text-muted">Email</dt><dd>{b.guestEmail ? <a href={`mailto:${b.guestEmail}`} className="text-deep hover:underline">{b.guestEmail}</a> : "—"}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd>{b.guestPhone ? <a href={`tel:${b.guestPhone}`} className="text-deep hover:underline">{b.guestPhone}</a> : "—"}</dd></div>
            <div><dt className="text-muted">Guests</dt><dd>{b.guestCount}</dd></div>
            <div><dt className="text-muted">Booked</dt><dd>{b.createdAt ? fmtDateTime(b.createdAt) : "—"}{b.cancelledAt && <> · cancelled {fmtDateTime(b.cancelledAt)}</>}</dd></div>
          </dl>
        </Card>

        <Card title="Money">
          <dl className="ui text-sm">
            <Row k={`${nights} × ${money(nights ? subtotal / nights : 0)}`} v={money(subtotal)} />
            <Row k="Cleaning fee" v={money(b.cleaningFee)} />
            <Row k="Lodging tax" v={money(b.tax)} />
            <Row k="Guest total" v={money(b.total)} strong />
          </dl>
          <p className="ui mt-2 text-[0.7rem] text-muted">Recorded for statements. Guests pay on Airbnb or Vrbo; nothing is charged here.</p>
        </Card>

        <Card title="Owner split">
          {split ? (
            <dl className="ui text-sm">
              <Row k="Owner" v={owner?.name ?? "Unknown"} />
              <Row k="Gross (nights)" v={split.gross != null ? money(split.gross) : "Not on file"} />
              <Row k={`Management fee (${split.feePercent}%)`} v={split.gross != null ? `− ${money(split.percentFee)}` : "n/a"} />
              <Row k="Fixed fee per stay" v={`− ${money(split.fixedFee)}`} />
              {split.net != null && <Row k="Net to owner" v={money(split.net)} strong />}
              <Row k="Cleaning (turnover)" v={money(split.cleaning)} />
              <Row k="Total charged to owner" v={money(split.totalFees)} strong />
            </dl>
          ) : <p className="ui text-sm text-muted">{b.source === "Owner stay" ? "Owner stays carry no fee." : "Cancelled and pending stays carry no fee."}</p>}
          {split && split.gross == null && <p className="ui mt-2 text-[0.7rem] text-muted">No nights amount on file (imported from the platform calendar), so only the fixed fee and cleaning apply.</p>}
          <p className="ui mt-2 text-[0.7rem] text-muted">Airbnb or Vrbo pays the homeowner under its payout rules and the Management Agreement.</p>
          {job && (
            <p className="ui mt-3 border-t border-line pt-2 text-xs text-muted">
              Turnover {fmtDate(job.scheduledDate)} · {cleanerName(job.cleanerId, cleaners)} · <Pill value={job.status} /> · <Link href="/admin/cleaning" className="text-deep hover:underline">board</Link>
            </p>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card title="Notes">
          {b.notes ? <pre className="ui whitespace-pre-wrap rounded-xl bg-mist/60 p-3 text-sm text-charcoal">{b.notes}</pre> : <p className="ui text-sm text-muted">No notes yet.</p>}
          <form action={addNoteAction.bind(null, b.id)} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Add a note" className="flex-1"><input name="note" required placeholder="Late arrival, allergy, early check-in approved…" className={inputClass} /></Field>
            <button type="submit" className={buttonClass}>Add</button>
          </form>
        </Card>

        <Card title="Actions">
          <div className="flex flex-col gap-2">
            <form action={cancelBookingAction.bind(null, b.id)}>
              <ConfirmButton className={`${dangerButtonClass} w-full`} message={`Cancel this stay here? The turnover is skipped. Cancel it on Airbnb or Vrbo too if it was booked there.`}>
                Cancel stay{!active && " (already inactive)"}
              </ConfirmButton>
            </form>
            <Link href={`/admin/calendar?month=${b.checkIn.slice(0, 7)}`} className={`${ghostButtonClass} w-full`}>Open on calendar</Link>
          </div>
          <p className="ui mt-3 text-[0.7rem] text-muted">Refunds and changes happen on the platform the guest booked on.</p>
        </Card>
      </div>
    </>
  );
}
