import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCleanerForClerkUser, getJobsForCleaner } from "@/lib/cleaning";
import JobCard from "@/components/clean/JobCard";
import NotLinked from "@/components/clean/NotLinked";
import StatusChip from "@/components/clean/StatusChip";
import { addDays, formatDay, todayPacific } from "@/components/clean/dates";
import { getPropertyInfo } from "./_data";

export const dynamic = "force-dynamic";

export default async function CleanHome() {
  const { userId } = await requireRole("cleaner");
  const cleaner = await getCleanerForClerkUser(userId);
  if (!cleaner) return <NotLinked />;

  const jobs = await getJobsForCleaner(cleaner.id);
  const props = await getPropertyInfo(jobs.map((j) => j.propertyId));
  const info = (id: string) => props.get(id) ?? { id, name: "Property", city: "", address: null, checkInTime: "16:00" };

  const today = todayPacific();
  const weekEnd = addDays(today, 7);
  const open = (s: string) => s !== "done" && s !== "skipped";
  const todays = jobs.filter((j) => j.scheduledDate === today && open(j.status));
  const upcoming = jobs.filter((j) => j.scheduledDate > today && j.scheduledDate <= weekEnd && open(j.status));
  const recent = jobs.filter((j) => j.status === "done").sort((a, b) => (b.completedAt ?? b.scheduledDate).localeCompare(a.completedAt ?? a.scheduledDate)).slice(0, 5);
  const firstName = cleaner.name.split(" ")[0];

  return (
    <div className="space-y-10">
      <header>
        <p className="caps-tight text-xs text-sky">{formatDay(today, { year: true })}</p>
        <h1 className="display mt-1 text-4xl leading-tight">Hi, {firstName}.</h1>
        <p className="mt-2 text-lg text-muted">
          {todays.length === 0 ? "Nothing on the board today." : todays.length === 1 ? "One turnover today." : `${todays.length} turnovers today.`}
        </p>
      </header>

      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="caps text-xs text-sky">Today</h2>
        <div className="mt-3 space-y-4">
          {todays.length === 0 ? (
            <Empty>No cleans scheduled for today. Enjoy the breather.</Empty>
          ) : (
            todays.map((j) => <JobCard key={j.id} job={j} property={info(j.propertyId)} showDate={false} />)
          )}
        </div>
      </section>

      <section aria-labelledby="week-heading">
        <h2 id="week-heading" className="caps text-xs text-sky">Next 7 days</h2>
        <div className="mt-3 space-y-4">
          {upcoming.length === 0 ? (
            <Empty>
              Nothing scheduled this week yet. Check the <Link href="/clean/calendar" className="underline decoration-wave underline-offset-4">calendar</Link> for what&apos;s further out.
            </Empty>
          ) : (
            upcoming.map((j) => <JobCard key={j.id} job={j} property={info(j.propertyId)} />)
          )}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="caps text-xs text-sky">Recent</h2>
        {recent.length === 0 ? (
          <div className="mt-3"><Empty>No finished jobs yet.</Empty></div>
        ) : (
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
            {recent.map((j) => {
              const p = info(j.propertyId);
              return (
                <li key={j.id}>
                  <Link href={`/clean/jobs/${j.id}`} className="flex min-h-[64px] items-center justify-between gap-3 px-5 py-3 active:bg-mist">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium">{p.name}</p>
                      <p className="text-sm text-muted">{formatDay(j.scheduledDate)}{p.city ? ` · ${p.city}` : ""}</p>
                    </div>
                    <StatusChip status={j.status} size="sm" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-line bg-white/60 p-5 text-base leading-relaxed text-muted">{children}</p>;
}
