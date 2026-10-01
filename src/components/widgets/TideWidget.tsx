import { getTides } from "@/lib/tides";
import TideScene from "./TideScene";

// Server component: fetches NOAA predictions (revalidated every 30 min) and
// renders the tide card. Returns null when the home has no tide station.
type Props = { stationId?: string | null; className?: string; forceSample?: boolean };

export default async function TideWidget({ stationId, className = "", forceSample }: Props) {
  if (!stationId) return null;
  const t = await getTides(stationId, 2, { forceSample });
  const trend = t.rising ? "rising" : "falling";
  const summary = `Tide at ${t.station.name}: ${t.level.toFixed(1)} feet and ${trend}.` +
    (t.nextHigh ? ` Next high ${t.nextHigh.height.toFixed(1)} feet at ${t.nextHigh.timeLabel}.` : "") +
    (t.nextLow ? ` Next low ${t.nextLow.height.toFixed(1)} feet at ${t.nextLow.timeLabel}.` : "");

  return (
    <section className={`overflow-hidden rounded-2xl border border-line bg-white ${className}`} aria-label={summary}>
      <div className="p-5 pb-4 sm:p-6 sm:pb-4">
        <p className="caps-tight text-[0.65rem] text-sky">Tide at {t.station.name}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="display text-5xl not-italic leading-none text-charcoal">
              {t.level.toFixed(1)}<span className="ui ml-1.5 text-base font-light text-muted">ft</span>
            </p>
            <p className="ui mt-2 flex items-center gap-1.5 text-sm text-deep">
              <span aria-hidden="true" className="text-base leading-none">{t.rising ? "↗" : "↘"}</span>
              <span className="capitalize">{trend}</span>
              {t.next && <span className="text-muted">· {t.next.type === "H" ? "high" : "low"} at {t.next.timeLabel}</span>}
            </p>
          </div>
          <dl className="ui grid grid-cols-2 gap-x-8 text-sm">
            <div>
              <dt className="caps-tight text-[0.6rem] text-muted">Next high</dt>
              <dd className="mt-1 text-charcoal">{t.nextHigh ? <>{t.nextHigh.height.toFixed(1)} ft <span className="text-muted">· {t.nextHigh.timeLabel}</span></> : "—"}</dd>
            </div>
            <div>
              <dt className="caps-tight text-[0.6rem] text-muted">Next low</dt>
              <dd className="mt-1 text-charcoal">{t.nextLow ? <>{t.nextLow.height.toFixed(1)} ft <span className="text-muted">· {t.nextLow.timeLabel}</span></> : "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
      <TideScene events={t.events} now={t.now.getTime()} level={t.level} />
      <p className="ui flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-[0.65rem] text-muted sm:px-6">
        <span>NOAA CO-OPS predictions · station {t.station.id} · feet above MLLW</span>
        {t.source === "sample" && <span className="rounded-full bg-mist px-2 py-0.5 text-deep">sample data</span>}
        {t.source === "unavailable" && <span className="rounded-full bg-mist px-2 py-0.5 text-deep">live data unavailable · showing sample</span>}
      </p>
    </section>
  );
}
