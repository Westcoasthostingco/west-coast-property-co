import StatTile from "@/components/StatTile";
import { money } from "@/lib/data";
import { percent, type Headline } from "@/lib/owner";

// The four numbers every owner page leads with, this month vs last month.
export default function HeadlineTiles({ h }: { h: Headline }) {
  const c = h.current;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Revenue this month" value={money(c.revenue)} delta={{ value: h.revenueDelta }} hint="Nights only, before our fee" />
      <StatTile label="Occupancy" value={percent(c.occupancy)} delta={{ value: h.occupancyDelta, suffix: " pts" }} hint={`${c.nightsBooked} of ${c.nightsAvailable} nights`} />
      <StatTile label="Average nightly rate" value={c.adr ? money(c.adr) : "—"} delta={{ value: h.adrDelta }} />
      <StatTile label="Nights booked" value={String(c.nightsBooked)} delta={{ value: h.nightsDelta, suffix: " nights" }} />
    </div>
  );
}
