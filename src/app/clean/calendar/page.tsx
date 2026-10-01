import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCleanerForClerkUser, getJobsForCleaner, type CleaningJob } from "@/lib/cleaning";
import NotLinked from "@/components/clean/NotLinked";
import { daysInMonth, firstWeekday, monthKey, monthLabel, parseMonth, shiftMonth, todayPacific } from "@/components/clean/dates";
import { getPropertyInfo } from "../_data";

export const dynamic = "force-dynamic";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

export default async function CleanCalendar(props: { searchParams: Promise<{ month?: string | string[] }> }) {
  const { userId } = await requireRole("cleaner");
  const cleaner = await getCleanerForClerkUser(userId);
  if (!cleaner) return <NotLinked />;

  const sp = await props.searchParams;
  const monthParam = Array.isArray(sp.month) ? sp.month[0] : sp.month;
  const { year, month } = parseMonth(monthParam);
  const key = monthKey(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const today = todayPacific();

  const jobs = (await getJobsForCleaner(cleaner.id)).filter((j) => j.scheduledDate.startsWith(key) && j.status !== "skipped");
  const info = await getPropertyInfo(jobs.map((j) => j.propertyId));
  const byDay = new Map<number, CleaningJob[]>();
  for (const j of jobs) {
    const d = Number(j.scheduledDate.slice(8, 10));
    byDay.set(d, [...(byDay.get(d) ?? []), j]);
  }

  const count = daysInMonth(year, month);
  const offset = firstWeekday(year, month);
  const cells: (number | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-2">
        <Link href={`/clean/calendar?month=${monthKey(prev.year, prev.month)}`} aria-label="Previous month" className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-2xl text-charcoal active:bg-mist">&lsaquo;</Link>
        <div className="text-center">
          <p className="caps-tight text-xs text-deep">My calendar</p>
          <h1 className="display text-3xl leading-tight">{monthLabel(year, month)}</h1>
        </div>
        <Link href={`/clean/calendar?month=${monthKey(next.year, next.month)}`} aria-label="Next month" className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-2xl text-charcoal active:bg-mist">&rsaquo;</Link>
      </header>

      <p className="text-center text-base text-muted">
        {jobs.length === 0 ? "No cleans this month." : `${jobs.length} ${jobs.length === 1 ? "clean" : "cleans"} this month.`}
        {key !== today.slice(0, 7) && (
          <> <Link href="/clean/calendar" className="underline decoration-wave underline-offset-4">Back to this month</Link></>
        )}
      </p>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="grid grid-cols-7 border-b border-line bg-mist">
          {weekdays.map((d, i) => (
            <div key={i} className="caps-tight py-2 text-center text-[11px] text-deep">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-[72px] border-b border-r border-line/60 bg-cream/50" />;
            const ymd = `${key}-${String(day).padStart(2, "0")}`;
            const isToday = ymd === today;
            const dayJobs = byDay.get(day) ?? [];
            return (
              <div key={i} className={`min-h-[72px] border-b border-r border-line/60 p-1 ${isToday ? "bg-mist/70" : ""}`}>
                <p className={`ui mb-1 text-center text-xs ${isToday ? "mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-deep font-medium text-white" : "text-muted"}`}>{day}</p>
                <div className="space-y-1">
                  {dayJobs.map((j) => {
                    const p = info.get(j.propertyId);
                    const done = j.status === "done";
                    return (
                      <Link
                        key={j.id}
                        href={`/clean/jobs/${j.id}`}
                        title={p?.name}
                        className={`block truncate rounded px-1 py-1 text-[11px] leading-tight ${done ? "bg-cream text-muted line-through" : j.status === "in_progress" ? "bg-deep text-white" : "bg-wave/60 text-charcoal"}`}
                      >
                        {p?.name ?? "Job"}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {jobs.length > 0 && (
        <section>
          <h2 className="caps text-xs text-deep">This month</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {jobs.map((j) => {
              const p = info.get(j.propertyId);
              return (
                <li key={j.id}>
                  <Link href={`/clean/jobs/${j.id}`} className="flex min-h-[56px] items-center justify-between gap-3 px-5 py-3 active:bg-mist">
                    <span className="truncate text-base font-medium">{p?.name}</span>
                    <span className="shrink-0 text-sm text-muted">{Number(j.scheduledDate.slice(8, 10))} {monthLabel(year, month).split(" ")[0].slice(0, 3)}{j.status === "done" ? " · done" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
