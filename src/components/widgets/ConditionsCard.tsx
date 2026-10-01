import { getTides } from "@/lib/tides";
import { getMountainConditions, type SkiResort } from "@/lib/weather";
import TideScene from "./TideScene";
import SkiScene from "./SkiScene";
import { WeatherGlyph } from "./SnowWidget";

// Compact conditions strip for property cards: a one-line summary plus the
// animated tide or ski scene. Server component; renders null when the home has
// neither a tide station nor a ski resort configured.
type Props = { tideStationId?: string | null; skiResort?: SkiResort | null; className?: string; forceSample?: boolean };

export default async function ConditionsCard({ tideStationId, skiResort, className = "", forceSample }: Props) {
  if (tideStationId) {
    const t = await getTides(tideStationId, 2, { forceSample });
    const trend = t.rising ? "rising" : "falling";
    return (
      <div className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`} aria-label={`Tide at ${t.station.name}: ${t.level.toFixed(1)} feet and ${trend}`}>
        <div className="ui flex h-10 items-center justify-between gap-3 px-4 text-xs">
          <span className="caps-tight min-w-0 truncate text-[0.6rem] text-deep">Tide · {t.station.name.split(",")[0]}</span>
          <span className="shrink-0 whitespace-nowrap text-charcoal">
            <span className="font-medium">{t.level.toFixed(1)} ft</span> <span className="text-muted">{trend}</span>
            {t.next && <span className="text-muted"> · {t.next.type === "H" ? "high" : "low"} {t.next.timeLabel}</span>}
          </span>
        </div>
        <TideScene events={t.events} now={t.now.getTime()} level={t.level} compact />
      </div>
    );
  }
  if (skiResort) {
    const c = await getMountainConditions(skiResort, { forceSample });
    return (
      <div className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`} aria-label={`Conditions at ${c.resort.name}: ${c.now.tempF} degrees, ${c.now.label.toLowerCase()}, ${c.snowDepthIn} inches of snow`}>
        <div className="ui flex h-10 items-center justify-between gap-3 px-4 text-xs">
          <span className="caps-tight min-w-0 truncate text-[0.6rem] text-deep">Snow · {c.resort.name}</span>
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-charcoal">
            <WeatherGlyph icon={c.now.icon} className="h-3.5 w-3.5 text-deep" />
            <span className="font-medium">{c.now.tempF}°F</span> <span className="text-muted">{c.now.label.toLowerCase()}</span>
            <span className="text-muted">· {c.snowDepthIn} in base</span>
          </span>
        </div>
        <SkiScene snowing={c.now.snowingNow} icon={c.now.icon} compact />
      </div>
    );
  }
  return null;
}
