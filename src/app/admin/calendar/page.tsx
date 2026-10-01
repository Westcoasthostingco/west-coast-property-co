import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton, PageHeader } from "@/components/admin/ui";
import { getAllProperties, getBookings } from "@/lib/data";
import { todayISO } from "@/lib/admin";

export const metadata: Metadata = { title: "Calendar" };

const DAY_PX = 44, LABEL_PX = 168;
const pad = (n: number) => String(n).padStart(2, "0");
const shiftMonth = (ym: string, by: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

export default async function MasterCalendar({ searchParams }: PageProps<"/admin/calendar">) {
  const sp = await searchParams;
  const today = todayISO();
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = `${month}-01`, last = `${month}-${pad(days)}`;
  const dayIso = (d: number) => `${month}-${pad(d)}`;
  const dayOfWeek = (d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

  const [props, bookings] = await Promise.all([getAllProperties(), getBookings()]);
  const stays = bookings.filter((b) => b.status !== "cancelled" && b.checkIn <= last && b.checkOut > first);
  const dayIndex = (iso: string) => Number(iso.slice(8, 10)); // 1-based within this month

  const title = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const gridCols = `${LABEL_PX}px repeat(${days}, ${DAY_PX}px)`;

  return (
    <>
      <PageHeader eyebrow="Master calendar" title={title} intro="One row per home. Bars run from check-in to check-out; a dot marks a turnover day."
        actions={
          <>
            <LinkButton ghost href={`/admin/calendar?month=${shiftMonth(month, -1)}`}>← Prev</LinkButton>
            <LinkButton ghost href="/admin/calendar">Today</LinkButton>
            <LinkButton ghost href={`/admin/calendar?month=${shiftMonth(month, 1)}`}>Next →</LinkButton>
            <LinkButton href="/admin/bookings/new">+ Booking</LinkButton>
          </>
        } />

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <div style={{ minWidth: LABEL_PX + days * DAY_PX }}>
          {/* header row */}
          <div className="ui grid border-b border-line" style={{ gridTemplateColumns: gridCols }}>
            <div className="sticky left-0 z-10 bg-white px-4 py-2 text-xs text-muted">Home</div>
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
              const iso = dayIso(d), isToday = iso === today, weekend = dayOfWeek(d) === 0 || dayOfWeek(d) === 6;
              return (
                <div key={d} className={`flex flex-col items-center py-1.5 text-[0.65rem] ${weekend ? "bg-mist/50" : ""}`}>
                  <span className="text-muted">{["S", "M", "T", "W", "T", "F", "S"][dayOfWeek(d)]}</span>
                  <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${isToday ? "bg-teal font-medium text-white" : "text-charcoal"}`}>{d}</span>
                </div>
              );
            })}
          </div>

          {props.map((p) => {
            const mine = stays.filter((b) => b.propertyId === p.id);
            const outs = new Set(mine.map((b) => b.checkOut));
            const turnovers = new Set(mine.filter((b) => outs.has(b.checkIn)).map((b) => b.checkIn));
            return (
              <div key={p.id} className="relative grid h-14 border-b border-line/70 last:border-b-0" style={{ gridTemplateColumns: gridCols }}>
                <div style={{ gridColumn: 1, gridRow: 1 }} className="sticky left-0 z-10 flex flex-col justify-center border-r border-line/70 bg-white px-4">
                  <Link href={`/admin/properties/${p.id}`} className="ui truncate text-sm font-medium text-charcoal hover:text-teal">{p.name}</Link>
                  <span className="ui truncate text-[0.65rem] text-muted">{p.city}</span>
                </div>
                {/* day cells */}
                {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                  const iso = dayIso(d), weekend = dayOfWeek(d) === 0 || dayOfWeek(d) === 6;
                  return (
                    <div key={d} style={{ gridColumn: d + 1, gridRow: 1 }} className={`relative border-l border-line/40 ${iso === today ? "bg-teal/10" : weekend ? "bg-mist/40" : ""}`}>
                      {outs.has(iso) && <span title={turnovers.has(iso) ? "Same-day turnover" : "Check-out, cleaning due"}
                        className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${turnovers.has(iso) ? "bg-[#b6633a]" : "bg-sky"}`} />}
                    </div>
                  );
                })}
                {/* stays as bars; grid column 1 is the label, so day d sits in column d+1 */}
                {mine.map((b) => {
                  const start = Math.max(1, dayIndex(b.checkIn <= first ? first : b.checkIn));
                  const endExclusive = b.checkOut > last ? days + 1 : dayIndex(b.checkOut);
                  if (endExclusive <= start) return null;
                  const clippedStart = b.checkIn < first, clippedEnd = b.checkOut > last;
                  const pending = b.status === "pending";
                  return (
                    <Link key={b.id} href={`/admin/bookings/${b.id}`} title={`${b.guest} · ${b.source} · ${b.checkIn} to ${b.checkOut}`}
                      style={{ gridColumn: `${start + 1} / ${endExclusive + 1}`, gridRow: 1 }}
                      className={`ui z-[5] my-2.5 ml-[2px] mr-[2px] flex min-w-0 items-center gap-1.5 overflow-hidden px-2 text-[0.7rem] leading-tight text-white transition hover:bg-teal-dark
                        ${pending ? "bg-sky" : "bg-teal"} ${clippedStart ? "rounded-l-none" : "rounded-l-full"} ${clippedEnd ? "rounded-r-none" : "rounded-r-full"}`}>
                      <span className="truncate font-medium">{b.guest}</span>
                      <span className="hidden truncate opacity-80 sm:inline">· {b.source}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ui flex flex-wrap gap-4 text-[0.7rem] text-muted">
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-6 rounded-full bg-teal" />Confirmed stay</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-3 w-6 rounded-full bg-sky" />Pending payment</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-1.5 w-1.5 rounded-full bg-sky" />Check-out, cleaning due</span>
        <span className="flex items-center gap-1.5"><i className="inline-block h-1.5 w-1.5 rounded-full bg-[#b6633a]" />Same-day turnover</span>
      </div>
    </>
  );
}
