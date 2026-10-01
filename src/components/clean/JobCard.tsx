import Link from "next/link";
import type { CleaningJob } from "@/lib/cleaning";
import StatusChip from "./StatusChip";
import { formatDay, formatTime, relativeDay } from "./dates";
import type { PropertyInfo } from "@/app/clean/_data";

export default function JobCard({ job, property, showDate = true }: { job: CleaningJob; property: PropertyInfo; showDate?: boolean }) {
  return (
    <Link
      href={`/clean/jobs/${job.id}`}
      className="block rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(58,68,72,0.04)] transition-colors active:bg-mist"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {showDate && <p className="caps-tight text-xs text-deep">{relativeDay(job.scheduledDate)}</p>}
          <h3 className="display mt-1 truncate text-2xl leading-tight">{property.name}</h3>
          <p className="mt-0.5 text-base text-muted">{property.city}</p>
        </div>
        <StatusChip status={job.status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-base">
        <div>
          <dt className="caps-tight text-[11px] text-deep">Check-out</dt>
          <dd className="ui mt-0.5 font-medium">{formatTime(job.windowStart) || "Flexible"}</dd>
        </div>
        <div>
          <dt className="caps-tight text-[11px] text-deep">Next check-in</dt>
          <dd className="ui mt-0.5 font-medium">
            {job.nextCheckIn ? `${formatDay(job.nextCheckIn)} · ${formatTime(property.checkInTime)}` : "Nobody yet"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
