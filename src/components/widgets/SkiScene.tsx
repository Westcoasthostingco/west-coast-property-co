"use client";
import type { WeatherIcon } from "@/lib/weather";

// Animated mountain scene: layered ridges with snow caps above a snow line, a
// groomed foreground slope, a skier gliding down on a loop, and falling snow
// when it is snowing. All motion is CSS; reduced-motion disables it.

type Props = { snowing: boolean; icon: WeatherIcon; className?: string; compact?: boolean };

const W = 480, H = 240;
const C = { deep: "#2f6f86", dusk: "#1e4b5c", ink: "#14323d", teal: "#6ba8bc", sky: "#8fc0ce", wave: "#a8d0dc", mist: "#eef5f7", snow: "#f4f8fa", cream: "#fbfdfc", charcoal: "#3a4448", pine: "#5a7580" };

// Foreground slope as a cubic Bézier; the skier follows it.
const P = [[-16, 98], [150, 104], [280, 190], [496, 212]] as const;
function bez(t: number) {
  const u = 1 - t;
  const x = u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0];
  const y = u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1];
  const dx = 3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]);
  const dy = 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1]);
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI };
}
const SLOPE = `M${P[0][0]},${P[0][1]} C${P[1][0]},${P[1][1]} ${P[2][0]},${P[2][1]} ${P[3][0]},${P[3][1]}`;

const skierFrames = (() => {
  const steps = 16;
  let css = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const { x, y, angle } = bez(t);
    const carve = 7 * Math.sin(t * Math.PI * 5); // gentle edge-to-edge turns
    css += `${(t * 100).toFixed(2)}% { transform: translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(angle + carve).toFixed(1)}deg); } `;
  }
  return css;
})();

const FLAKES = Array.from({ length: 42 }, (_, i) => ({
  x: (i * 97 + 23) % W,
  r: 1 + ((i * 31) % 9) / 7,
  dur: 7 + ((i * 13) % 7),
  delay: -((i * 17) % 13),
  o: 0.55 + ((i * 7) % 4) / 10,
}));

function Ridge({ peaks, base, color, snowLine }: { peaks: [number, number][]; base: number; color: string; snowLine: number }) {
  const d = `M-4,${base} ` + peaks.map(([x, y]) => `L${x},${y}`).join(" ") + ` L${W + 4},${base} Z`;
  const id = `sk-clip-${base}`;
  return (
    <g>
      <defs><clipPath id={id}><rect x={-4} y={0} width={W + 8} height={snowLine} /></clipPath></defs>
      <path d={d} fill={color} />
      <path d={d} fill={C.cream} clipPath={`url(#${id})`} opacity={0.92} />
    </g>
  );
}

function Tree({ x, h = 18, color = C.pine }: { x: number; h?: number; color?: string }) {
  // place the tree base on the slope: solve for t by bisection on x
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bez(m).x < x) lo = m; else hi = m; }
  const { y } = bez((lo + hi) / 2);
  return <path d={`M${x},${y + 1} l${-h * 0.32},0 l${h * 0.32},${-h} l${h * 0.32},${h} z M${x - h * 0.24},${y + 1 - h * 0.42} l${h * 0.24},${-h * 0.5} l${h * 0.24},${h * 0.5} z`} fill={color} />;
}

// Compact shows the 480x155 band from y=56 to y=211 (crops empty sky and the
// lower foreground), the same size as the compact tide scene.
export default function SkiScene({ snowing, icon, className = "", compact = false }: Props) {
  const overcast = icon !== "sun";
  return (
    <svg viewBox={compact ? `0 56 ${W} 155` : `0 0 ${W} ${H}`} className={`block w-full overflow-hidden ${className}`} role="img"
      aria-label={snowing ? "Mountain scene with falling snow and a skier on the slope" : "Mountain scene with a skier on the slope"}>
      <style>{`
        @keyframes sk-run { ${skierFrames} }
        @keyframes sk-fade { 0%, 100% { opacity: 0; } 7%, 93% { opacity: 1; } }
        @keyframes sk-fall { from { transform: translate(0, -12px); } to { transform: translate(18px, ${H + 12}px); } }
        .sk-skier { animation: sk-run 11s cubic-bezier(.45,.05,.55,.95) infinite, sk-fade 11s linear infinite; }
        .sk-flake { animation-name: sk-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sk-skier { animation: none; transform: translate(${bez(0.42).x.toFixed(1)}px, ${bez(0.42).y.toFixed(1)}px) rotate(${bez(0.42).angle.toFixed(1)}deg); }
          .sk-flake { animation: none; }
        }
      `}</style>
      <defs>
        <linearGradient id="sk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={overcast ? "#e4edf1" : C.mist} /><stop offset="1" stopColor={overcast ? C.wave : "#bfdbe4"} />
        </linearGradient>
        <linearGradient id="sk-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.cream} /><stop offset="1" stopColor={C.mist} />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#sk-sky)" />
      {!overcast && <circle cx={392} cy={44} r={22} fill={C.cream} opacity={0.95} />}

      {/* far and mid ridges with snow caps */}
      <Ridge base={176} color={C.sky} snowLine={112} peaks={[[0, 150], [60, 118], [110, 138], [175, 92], [215, 122], [255, 102], [300, 134], [350, 110], [410, 128], [450, 96], [480, 118]]} />
      <Ridge base={200} color={C.deep} snowLine={150} peaks={[[0, 182], [50, 168], [120, 176], [190, 146], [240, 164], [330, 136], [380, 160], [440, 148], [480, 170]]} />
      {/* chairlift cable */}
      <g stroke={C.dusk} strokeWidth={1} opacity={0.45} fill={C.dusk}>
        <line x1={96} y1={70} x2={458} y2={166} />
        {[0.2, 0.5, 0.8].map((f) => {
          const cx = 96 + f * (458 - 96), cy = 70 + f * (166 - 70);
          return <g key={f}><line x1={cx} y1={cy} x2={cx} y2={cy + 7} /><rect x={cx - 3} y={cy + 7} width={6} height={4} rx={1} /></g>;
        })}
        <line x1={96} y1={70} x2={96} y2={118} strokeWidth={1.5} /><line x1={458} y1={166} x2={458} y2={200} strokeWidth={1.5} />
      </g>

      {/* foreground slope */}
      <path d={`${SLOPE} L${W + 8},${H + 8} L-8,${H + 8} Z`} fill="url(#sk-snow)" />
      <path d={SLOPE} fill="none" stroke={C.wave} strokeWidth={1.5} />
      {/* groomer lines */}
      <g stroke={C.wave} strokeWidth={1} opacity={0.5} fill="none">
        <path d="M30,150 C140,150 230,205 440,232" /><path d="M90,170 C180,178 260,222 400,240" />
      </g>
      {/* trees */}
      <Tree x={28} h={22} color={C.charcoal} /><Tree x={62} h={16} /><Tree x={104} h={20} color={C.charcoal} />
      <Tree x={382} h={18} /><Tree x={420} h={24} color={C.charcoal} /><Tree x={452} h={15} />

      {/* skier, drawn at the origin with skis on y=0 */}
      <g className="sk-skier" fill="none" stroke={C.charcoal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ transformOrigin: "0 0" }}>
        <g transform="translate(0,-1) scale(1.35)">
          <line x1={-10} y1={0} x2={11} y2={0} strokeWidth={2.2} />
          <path d="M-1,0 L1,-7 L4,-12" />
          <path d="M4,-12 L0,-21" />
          <circle cx={-1.5} cy={-24.5} r={3} fill={C.charcoal} stroke="none" />
          <path d="M3,-17 L9,-9" strokeWidth={1.2} /><path d="M-1,-16 L-7,-7" strokeWidth={1.2} />
        </g>
      </g>

      {/* falling snow */}
      {snowing && (
        <g fill={C.cream}>
          {FLAKES.map((f, i) => (
            <circle key={i} className="sk-flake" cx={f.x} cy={0} r={f.r} opacity={f.o}
              style={{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }} />
          ))}
        </g>
      )}
    </svg>
  );
}
