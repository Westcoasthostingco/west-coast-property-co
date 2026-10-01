// Three months of availability. Booked nights are shaded; a check-out day is free
// for a new check-in. Server component: no client JS.
type Stay = { checkIn: string; checkOut: string };

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function AvailabilityCalendar({ stays, months = 3, minNights }: { stays: Stay[]; months?: number; minNights?: number }) {
  const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const today = iso(new Date());
  const booked = (day: string) => stays.some((s) => day >= s.checkIn && day < s.checkOut);

  return (
    <div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: months }, (_, m) => {
          const first = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + m, 1));
          const daysIn = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
          const offset = first.getUTCDay();
          return (
            <div key={m}>
              <p className="caps-tight mb-3 text-[0.65rem] text-sky">{first.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
              <div className="ui grid grid-cols-7 gap-1 text-center text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="text-muted">{d}</span>)}
                {Array.from({ length: offset }, (_, i) => <span key={`o${i}`} />)}
                {Array.from({ length: daysIn }, (_, i) => {
                  const day = iso(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), i + 1)));
                  const past = day < today, taken = booked(day);
                  return (
                    <span key={day} title={taken ? "Booked" : past ? "" : "Available"}
                      className={`rounded-md py-1.5 ${past ? "text-line" : taken ? "bg-line text-muted line-through" : "bg-white text-charcoal ring-1 ring-line"}`}>
                      {i + 1}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="ui mt-4 text-xs text-muted">
        <span className="mr-1 inline-block h-3 w-3 rounded-sm bg-white ring-1 ring-line align-middle" /> available
        <span className="ml-4 mr-1 inline-block h-3 w-3 rounded-sm bg-line align-middle" /> booked
        {minNights ? <span className="ml-4">Minimum stay {minNights} nights</span> : null}
      </p>
    </div>
  );
}
