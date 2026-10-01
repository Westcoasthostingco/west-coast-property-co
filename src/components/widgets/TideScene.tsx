"use client";
import { tideLevelAt, timeLabel, type TideEvent } from "@/lib/tides";

// Animated tide scene: sky, 24h tide curve (feet on the same scale as the
// gauge piling), shore + dock, and a water body whose surface sits at the
// current level. Waves drift via CSS keyframes; the surface moves with a CSS
// transition when the level prop changes. Everything is deterministic from
// props, so it hydrates cleanly.

type Props = { events: TideEvent[]; now: number; level: number; className?: string; compact?: boolean };

const W = 480, HOUR = 3600_000;
// Full scene is 480x270. Compact (property cards) is 480x206, about 24% shorter,
// with the same type sizes and the tide range squeezed into less height.
const FULL = { H: 270, TOP: 56, BOTTOM: 238 }, COMPACT = { H: 206, TOP: 60, BOTTOM: 174 };
const C = { deep: "#2f6f86", dusk: "#1e4b5c", teal: "#6ba8bc", sky: "#8fc0ce", wave: "#a8d0dc", mist: "#eef5f7", line: "#dde9ed", charcoal: "#3a4448", muted: "#6b777c", cream: "#fbfdfc", sand: "#e6eef1", pine: "#5a7580" };

function wavePath(period: number, amp: number, width: number) {
  let d = `M0,0`;
  for (let x = 0; x < width; x += period) d += ` q${period / 4},${-amp} ${period / 2},0 t${period / 2},0`;
  return d + ` L${width},12 L0,12 Z`;
}

export default function TideScene({ events, now, level, className = "", compact = false }: Props) {
  const { H, TOP, BOTTOM } = compact ? COMPACT : FULL;
  const start = Math.floor((now - 4 * HOUR) / HOUR) * HOUR;
  const span = 24 * HOUR;
  const x = (t: number) => ((t - start) / span) * W;

  const heights = events.map((e) => e.height);
  const minFt = Math.floor(Math.min(0, ...heights) - 0.5);
  const maxFt = Math.ceil(Math.max(1, ...heights) + 1);
  const y = (ft: number) => BOTTOM - ((ft - minFt) / (maxFt - minFt)) * (BOTTOM - TOP);

  // Curve sampled every 10 minutes across the window.
  const pts: string[] = [];
  for (let t = start; t <= start + span; t += 10 * 60_000) {
    const r = tideLevelAt(events, t);
    if (r) pts.push(`${x(t).toFixed(1)},${y(r.level).toFixed(1)}`);
  }
  const curve = pts.length ? `M${pts.join(" L")}` : "";

  const surfaceY = y(level);
  const dockY = y(Math.max(...heights) + 0.9);
  const gaugeX = 150;
  const ticks: number[] = [];
  for (let ft = Math.ceil(minFt); ft <= maxFt; ft++) ticks.push(ft);

  // Hour labels every 6 hours.
  const hours: number[] = [];
  for (let t = Math.ceil(start / (6 * HOUR)) * 6 * HOUR; t < start + span; t += 6 * HOUR) hours.push(t);
  const hourText = (t: number) => {
    const h = new Date(t).getUTCHours();
    return h === 0 ? "12 am" : h === 12 ? "noon" : h < 12 ? `${h} am` : `${h - 12} pm`;
  };

  const inWindow = events.filter((e) => e.time >= start + 0.6 * HOUR && e.time <= start + span - 0.6 * HOUR);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block w-full overflow-hidden ${className}`} role="img"
      aria-label={`Tide scene: water level ${level.toFixed(1)} feet, chart of the next 24 hours`}>
      <style>{`
        .tw-wave-a { animation: tw-drift 9s linear infinite; }
        .tw-wave-b { animation: tw-drift 14s linear infinite reverse; }
        .tw-water { transition: transform 1.4s cubic-bezier(.4,0,.2,1); }
        @keyframes tw-drift { from { transform: translateX(0); } to { transform: translateX(-120px); } }
        @media (prefers-reduced-motion: reduce) { .tw-wave-a, .tw-wave-b { animation: none; } .tw-water { transition: none; } }
      `}</style>
      <defs>
        <linearGradient id="tw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cream} /><stop offset="1" stopColor={C.mist} />
        </linearGradient>
        <linearGradient id="tw-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.teal} /><stop offset="0.35" stopColor={C.deep} /><stop offset="1" stopColor={C.dusk} />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#tw-sky)" />

      {/* hour grid (recessive) + labels along the top */}
      {hours.filter((t) => x(t) > 22).map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={40} y2={BOTTOM} stroke={C.line} strokeWidth={1} />
          <text x={x(t)} y={30} textAnchor="middle" fontSize={11} fill={C.muted} fontFamily="var(--font-poppins)">{hourText(t)}</text>
        </g>
      ))}

      {/* shore and dock (behind water) */}
      <path d={`M0,${TOP + 20} C50,${TOP + 40} 70,${BOTTOM - 40} 125,${BOTTOM + 8} L0,${BOTTOM + 8} Z`} fill={C.sand} />
      <path d={`M0,${TOP + 20} C50,${TOP + 40} 70,${BOTTOM - 40} 125,${BOTTOM + 8}`} fill="none" stroke={C.wave} strokeWidth={1.5} />
      {/* trees on the point */}
      <g fill={C.pine} opacity={0.75}>
        <path d={`M14,${TOP + 22} l-7,0 l7,-26 l7,26 z`} /><path d={`M30,${TOP + 28} l-6,0 l6,-20 l6,20 z`} /><path d={`M46,${TOP + 36} l-5,0 l5,-16 l5,16 z`} />
      </g>
      <g fill={C.charcoal} opacity={0.65}>
        <rect x={92} y={dockY + 4} width={2.5} height={BOTTOM - dockY + 6} />
        <rect x={124} y={dockY + 4} width={2.5} height={BOTTOM - dockY + 6} />
        <rect x={60} y={dockY} width={94} height={4} rx={1} />
        <rect x={60} y={dockY + 4} width={94} height={1.5} opacity={0.4} />
      </g>
      {/* gauge piling with feet ticks */}
      <rect x={gaugeX} y={dockY - 12} width={7} height={BOTTOM - dockY + 20} rx={1} fill={C.charcoal} opacity={0.75} />
      <g fontFamily="var(--font-poppins)" fontSize={10} fill={C.muted}>
        {ticks.map((ft) => (
          <g key={ft}>
            <line x1={gaugeX + 7} x2={gaugeX + (ft % 2 === 0 ? 13 : 10)} y1={y(ft)} y2={y(ft)} stroke={C.charcoal} strokeWidth={1} opacity={0.7} />
            {ft % 4 === 0 && <text x={gaugeX + 16} y={y(ft) + 3.5} fill={ft < level ? C.cream : C.muted}>{ft} ft</text>}
          </g>
        ))}
      </g>

      {/* water: group translated to the surface; waves drift horizontally */}
      <g className="tw-water" style={{ transform: `translateY(${surfaceY.toFixed(1)}px)` }}>
        <g className="tw-wave-b" style={{ transform: "translateY(-3px)" }}>
          <path d={wavePath(96, 3, W + 240)} fill={C.wave} opacity={0.75} />
        </g>
        <g className="tw-wave-a">
          <path d={wavePath(120, 3.5, W + 240)} fill={C.teal} />
        </g>
        <rect x={0} y={6} width={W} height={400} fill="url(#tw-sea)" opacity={0.96} />
        {/* faint ripple lines */}
        {[22, 44, 70].map((dy, i) => (
          <path key={dy} d={`M0,${dy} q40,-4 80,0 t80,0 t80,0 t80,0 t80,0 t80,0`} fill="none" stroke={C.wave} strokeWidth={1.5} opacity={0.35 - i * 0.08} />
        ))}
      </g>

      {/* 24h curve + markers (on top of water) */}
      {curve && <path d={curve} fill="none" stroke={C.cream} strokeWidth={4} opacity={0.5} strokeLinejoin="round" />}
      {curve && <path d={curve} fill="none" stroke={C.dusk} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />}
      {inWindow.map((e) => {
        const ex = x(e.time), ey = y(e.height);
        const above = e.type === "H";
        const anchor = ex < 40 ? "start" : ex > W - 40 ? "end" : "middle";
        return (
          <g key={e.time} fontFamily="var(--font-poppins)" textAnchor={anchor}>
            <circle cx={ex} cy={ey} r={2.5} fill={above ? C.dusk : C.cream} stroke={C.dusk} strokeWidth={1.2} />
            <text x={ex} y={above ? ey - 16 : ey + 16} fontSize={12} fontWeight={500} fill={above ? C.charcoal : C.cream} stroke={above ? C.cream : C.deep} strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">{e.height.toFixed(1)} ft</text>
            <text x={ex} y={above ? ey - 5 : ey + 28} fontSize={10} fill={above ? C.muted : C.wave} stroke={above ? C.cream : C.deep} strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">{above ? "high" : "low"} {e.timeLabel}</text>
          </g>
        );
      })}
      {/* now */}
      <line x1={x(now)} x2={x(now)} y1={20} y2={surfaceY} stroke={C.deep} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={x(now)} cy={surfaceY} r={5} fill={C.deep} stroke={C.cream} strokeWidth={2} />
      <text x={x(now)} y={14} textAnchor="middle" fontSize={10} fontWeight={500} fill={C.deep} fontFamily="var(--font-poppins)" style={{ textTransform: "uppercase", letterSpacing: "0.14em" }}>now {timeLabel(now)}</text>
    </svg>
  );
}
