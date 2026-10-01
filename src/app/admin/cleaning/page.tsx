import type { Metadata } from "next";
import Link from "next/link";
import AutoSubmitSelect from "@/components/admin/AutoSubmitSelect";
import { Card, DataTable, Empty, Notice, PageHeader, Pill, inputClass } from "@/components/admin/ui";
import { assignCleanerAction, setJobStatusAction } from "@/app/admin/actions";
import { getAllProperties, money, nameMap } from "@/lib/data";
import { getAllJobs, getCleaners, type CleaningJob, type CleaningStatus } from "@/lib/cleaning";
import { addDays, fmtDate, jobsInRange, todayISO } from "@/lib/admin";

export const metadata: Metadata = { title: "Cleaning" };

const STATUSES: CleaningStatus[] = ["unassigned", "assigned", "in_progress", "done", "skipped"];
const fmtTime = (t?: string | null) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""}${h >= 12 ? "pm" : "am"}`;
};

export default async function CleaningBoard({ searchParams }: PageProps<"/admin/cleaning">) {
  const sp = await searchParams;
  const tab = sp.tab === "past" ? "past" : "upcoming";
  const cleanerFilter = typeof sp.cleaner === "string" ? sp.cleaner : "";
  const statusFilter = typeof sp.status === "string" ? sp.status : "";
  const today = todayISO();

  const [jobs, cleaners, props] = await Promise.all([getAllJobs(), getCleaners(), getAllProperties()]);
  const propertyName = nameMap(props);
  const window = tab === "past" ? jobsInRange(jobs, addDays(today, -30), addDays(today, -1)) : jobsInRange(jobs, today, addDays(today, 30));
  const filtered = window
    .filter((j) => !cleanerFilter || (cleanerFilter === "none" ? !j.cleanerId : j.cleanerId === cleanerFilter))
    .filter((j) => !statusFilter || j.status === statusFilter);

  const qs = new URLSearchParams();
  if (tab === "past") qs.set("tab", "past");
  if (cleanerFilter) qs.set("cleaner", cleanerFilter);
  if (statusFilter) qs.set("status", statusFilter);
  const returnTo = `/admin/cleaning${qs.size ? `?${qs}` : ""}`;

  const byDate = new Map<string, CleaningJob[]>();
  for (const j of filtered) byDate.set(j.scheduledDate, [...(byDate.get(j.scheduledDate) ?? []), j]);
  const dates = [...byDate.keys()].sort((a, b) => (tab === "past" ? b.localeCompare(a) : a.localeCompare(b)));

  const unassignedCount = window.filter((j) => j.status === "unassigned").length;
  const doneJobs = window.filter((j) => j.status === "done");
  const totalCost = doneJobs.reduce((s, j) => s + (j.cost ?? 0), 0);

  return (
    <>
      <PageHeader eyebrow="Turnovers" title="Cleaning board"
        intro={tab === "past" ? `Past 30 days · ${doneJobs.length} done · ${money(totalCost)} cleaning cost` : `Next 30 days · ${window.length} turnovers · ${unassignedCount} unassigned`} />
      <Notice searchParams={sp} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="ui flex rounded-full border border-line bg-white p-1 text-xs">
          <Link href="/admin/cleaning" className={`rounded-full px-3 py-1 ${tab === "upcoming" ? "bg-teal text-white" : "text-muted hover:text-charcoal"}`}>Next 30 days</Link>
          <Link href="/admin/cleaning?tab=past" className={`rounded-full px-3 py-1 ${tab === "past" ? "bg-teal text-white" : "text-muted hover:text-charcoal"}`}>Past 30 days</Link>
        </div>
        <form method="get" className="ui flex flex-wrap gap-2 text-sm">
          {tab === "past" && <input type="hidden" name="tab" value="past" />}
          <select name="cleaner" defaultValue={cleanerFilter} className={`${inputClass} w-auto py-1.5`} aria-label="Cleaner">
            <option value="">All cleaners</option>
            <option value="none">Unassigned only</option>
            {cleaners.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="status" defaultValue={statusFilter} className={`${inputClass} w-auto py-1.5`} aria-label="Status">
            <option value="">Any status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <button type="submit" className="rounded-full border border-teal px-3 py-1.5 text-xs text-teal hover:bg-teal hover:text-white">Filter</button>
        </form>
      </div>

      {tab === "past" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {cleaners.map((c) => {
            const mine = doneJobs.filter((j) => j.cleanerId === c.id);
            return (
              <Card key={c.id}>
                <p className="caps-tight text-[0.65rem] text-sky">{c.name}</p>
                <p className="display mt-1 text-3xl not-italic text-charcoal">{money(mine.reduce((s, j) => s + (j.cost ?? 0), 0))}</p>
                <p className="ui text-xs text-muted">{mine.length} jobs · {money(c.payRate)} per job</p>
              </Card>
            );
          })}
        </div>
      )}

      {dates.length === 0 && <Empty>No turnovers match.</Empty>}
      {dates.map((date) => (
        <section key={date} className="space-y-2">
          <h2 className="ui flex items-baseline gap-2 text-sm">
            <span className={`font-medium ${date === today ? "text-teal" : "text-charcoal"}`}>{fmtDate(date, { weekday: "long", month: "short", day: "numeric" })}</span>
            {date === today && <span className="caps-tight text-[0.6rem] text-teal">today</span>}
            <span className="text-xs text-muted">{byDate.get(date)!.length} job{byDate.get(date)!.length === 1 ? "" : "s"}</span>
          </h2>
          <DataTable head={["Home", "Window", "Cleaner", "Status", "Next check-in", tab === "past" ? "Cost" : "Booking"]}
            rows={byDate.get(date)!.map((j) => [
              <span key="p" className="font-medium">{propertyName(j.propertyId)}</span>,
              j.windowStart ? `${fmtTime(j.windowStart)} – ${fmtTime(j.windowEnd)}` : "—",
              <form key="a" action={assignCleanerAction} className="flex items-center gap-2">
                <input type="hidden" name="jobId" value={j.id} />
                <input type="hidden" name="return" value={returnTo} />
                <AutoSubmitSelect name="cleanerId" defaultValue={j.cleanerId ?? ""} aria-label={`Cleaner for ${propertyName(j.propertyId)} on ${date}`}
                  className={`${inputClass} w-auto py-1 text-xs ${!j.cleanerId ? "border-[#e6b8a2]" : ""}`} disabled={j.status === "done" || j.status === "skipped"}>
                  <option value="">Unassigned</option>
                  {cleaners.filter((c) => c.active || c.id === j.cleanerId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </AutoSubmitSelect>
                <noscript><button type="submit" className="text-xs text-teal">Save</button></noscript>
              </form>,
              <form key="s" action={setJobStatusAction} className="flex items-center gap-2">
                <input type="hidden" name="jobId" value={j.id} />
                <input type="hidden" name="return" value={returnTo} />
                <Pill value={j.status} />
                <AutoSubmitSelect name="status" defaultValue={j.status} aria-label="Change status" className={`${inputClass} w-auto py-1 text-xs`}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </AutoSubmitSelect>
              </form>,
              j.nextCheckIn ? <span key="n" className={j.nextCheckIn === j.scheduledDate ? "font-medium text-[#b6633a]" : ""}>{j.nextCheckIn === j.scheduledDate ? "Same day" : fmtDate(j.nextCheckIn)}</span> : <span key="n" className="text-muted">open</span>,
              tab === "past" ? (j.cost != null ? money(j.cost) : "—")
                : j.bookingId ? <Link key="b" href={`/admin/bookings/${j.bookingId}`} className="text-teal hover:underline">stay ↗</Link> : "—",
            ])} />
        </section>
      ))}
    </>
  );
}
