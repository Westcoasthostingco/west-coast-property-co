import { getMountainConditions, type SkiResort, type WeatherIcon } from "@/lib/weather";
import SkiScene from "./SkiScene";

// Server component: fetches the Open-Meteo forecast for the nearest ski area
// (revalidated every 30 min) and renders the conditions card.
type Props = { resort?: SkiResort | null; className?: string; forceSample?: boolean };

export function WeatherGlyph({ icon, className = "h-5 w-5" }: { icon: WeatherIcon; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const cloud = <path d="M7 17h10a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.7 9.1 4 4 0 0 0 7 17z" />;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
      {icon === "sun" && <><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></>}
      {icon === "cloud" && cloud}
      {icon === "rain" && <><path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.7 6.1 4 4 0 0 0 7 14z" /><path d="M9 17l-1 3M13 17l-1 3M17 17l-1 3" /></>}
      {icon === "snow" && <><path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.7 6.1 4 4 0 0 0 7 14z" /><path d="M8.5 18.5h.01M12 20.5h.01M15.5 18.5h.01M12 17h.01" strokeWidth={2.4} /></>}
      {icon === "fog" && <><path d="M7 12h10a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.7 4.1 4 4 0 0 0 7 12z" /><path d="M5 16h14M7 20h10" /></>}
      {icon === "storm" && <><path d="M7 14h10a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 7.7 6.1 4 4 0 0 0 7 14z" /><path d="M13 14l-2.5 4h3L11 22" /></>}
    </svg>
  );
}

export default async function SnowWidget({ resort, className = "", forceSample }: Props) {
  if (!resort) return null;
  const c = await getMountainConditions(resort, { forceSample });
  const summary = `Conditions at ${c.resort.name}: ${c.now.tempF} degrees, ${c.now.label.toLowerCase()}, wind ${c.now.windMph} miles per hour, snow depth ${c.snowDepthIn} inches.`;

  return (
    <section className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`} aria-label={summary}>
      <div className="p-5 pb-4 sm:p-6 sm:pb-4">
        <p className="caps-tight text-[0.65rem] text-sky">Conditions at {c.resort.name}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex items-end gap-6">
            <div>
              <p className="display text-5xl not-italic leading-none text-charcoal">{c.now.tempF}<span className="ui ml-0.5 align-top text-xl font-light text-muted">°F</span></p>
              <p className="ui mt-2 flex items-center gap-1.5 text-sm text-deep">
                <WeatherGlyph icon={c.now.icon} />
                <span>{c.now.label}</span>
                <span className="text-muted">· wind {c.now.windMph} mph</span>
              </p>
            </div>
            <div>
              <p className="display text-5xl not-italic leading-none text-charcoal">{c.snowDepthIn}<span className="ui ml-1.5 text-base font-light text-muted">in</span></p>
              <p className="ui mt-2 text-sm text-muted">snow depth</p>
            </div>
          </div>
          <ol className="ui grid grid-cols-4 gap-x-4 text-sm" aria-label="Four-day forecast">
            {c.days.map((d) => (
              <li key={d.date} className="min-w-[3.25rem]">
                <p className="caps-tight text-[0.6rem] text-muted">{d.label}</p>
                <p className="mt-1 flex items-center gap-1 whitespace-nowrap text-charcoal" title={d.condition}>
                  <WeatherGlyph icon={d.icon} className="h-4 w-4 text-teal" />
                  <span>{d.hiF}°</span><span className="text-muted">{d.loF}°</span>
                </p>
                <p className="mt-0.5 whitespace-nowrap text-xs text-deep">{d.snowfallIn > 0 ? `+${d.snowfallIn.toFixed(1)} in` : <span className="text-muted">no snow</span>}</p>
                <span className="sr-only">{d.condition}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <SkiScene snowing={c.now.snowingNow} icon={c.now.icon} />
      <p className="ui flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-[0.65rem] text-muted sm:px-6">
        <span>Open-Meteo forecast · {c.resort.lat.toFixed(2)}, {c.resort.lng.toFixed(2)} · updated every 30 min</span>
        {c.source === "sample" && <span className="rounded-full bg-mist px-2 py-0.5 text-deep">sample data</span>}
        {c.source === "unavailable" && <span className="rounded-full bg-mist px-2 py-0.5 text-deep">live data unavailable · showing sample</span>}
      </p>
    </section>
  );
}
