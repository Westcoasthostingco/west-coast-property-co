import { getTides } from "@/lib/tides";
import { getMountainConditions, type SkiResort } from "@/lib/weather";

// Optional one-line pill for property cards: "Tide rising · 8.4 ft" or
// "28°F, light snow". Server component; renders null without a config.
type Props = { tideStationId?: string | null; skiResort?: SkiResort | null; className?: string; forceSample?: boolean };

export default async function ConditionsBadge({ tideStationId, skiResort, className = "", forceSample }: Props) {
  let text: string | null = null;
  if (tideStationId) {
    const t = await getTides(tideStationId, 1, { forceSample });
    text = `Tide ${t.rising ? "rising" : "falling"} · ${t.level.toFixed(1)} ft`;
  } else if (skiResort) {
    const c = await getMountainConditions(skiResort, { forceSample });
    text = `${c.now.tempF}°F, ${c.now.label.toLowerCase()}`;
  }
  if (!text) return null;
  return (
    <span className={`ui inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs text-deep ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal" />
      {text}
    </span>
  );
}
