// Hand-drawn SVG scenes in the brand palette. Used as placeholders until real
// photos are uploaded, and as the hero backdrop. Pure SVG, no assets.
type Scene = "harbor" | "canal" | "forest" | "hero";

const C = { deep: "#3f7f95", teal: "#6ba8bc", sky: "#8fc0ce", wave: "#a8d0dc", mist: "#dbe9ee", cream: "#fbfdfc", charcoal: "#3a4448", pine: "#5a7580" };

function Mountains({ y = 120, color = C.sky, peaks = [[0, 60], [120, 10], [220, 50], [330, 0], [440, 55], [560, 20], [640, 70]] as [number, number][] }) {
  const d = `M0,${y} ` + peaks.map(([x, h]) => `L${x},${y - h}`).join(" ") + ` L640,${y} Z`;
  return <path d={d} fill={color} />;
}

function Water({ y, color = C.teal, light = C.wave }: { y: number; color?: string; light?: string }) {
  return (
    <g>
      <rect x="0" y={y} width="640" height={360 - y} fill={color} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M0,${y + 18 + i * 28} q40,-6 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0`} fill="none" stroke={light} strokeOpacity={0.5 - i * 0.08} strokeWidth="2" />
      ))}
    </g>
  );
}

function Sun({ x, y, r = 26 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill={C.cream} opacity="0.9" />;
}

function Trees({ y, count = 14, color = C.pine }: { y: number; count?: number; color?: string }) {
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const x = 10 + i * (620 / count) + ((i * 37) % 17);
        const h = 48 + ((i * 53) % 40);
        return <path key={i} d={`M${x},${y} l${-10},0 l10,${-h} l10,${h} z M${x - 7},${y - h * 0.45} l7,${-h * 0.5} l7,${h * 0.5} z`} />;
      })}
    </g>
  );
}

export default function Horizon({ scene, className = "", label, align = "xMidYMid" }: { scene: Scene; className?: string; label?: string; align?: string }) {
  return (
    <svg viewBox="0 0 640 360" preserveAspectRatio={`${align} slice`} className={className} role="img" aria-label={label ?? scene}>
      <defs>
        <linearGradient id={`sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.mist} />
          <stop offset="1" stopColor={C.wave} />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#sky-${scene})`} />
      {scene === "harbor" && (
        <>
          <Sun x={520} y={70} />
          <Mountains y={200} color={C.sky} peaks={[[0, 30], [90, 70], [160, 40], [260, 110], [330, 60], [420, 20], [520, 50], [640, 10]]} />
          <Mountains y={215} color={C.teal} peaks={[[0, 20], [140, 45], [300, 30], [450, 55], [640, 15]]} />
          <Water y={215} />
          {/* harbor docks */}
          <g fill={C.charcoal} opacity="0.55">
            <rect x="60" y="222" width="160" height="4" /><rect x="80" y="226" width="4" height="22" /><rect x="190" y="226" width="4" height="22" />
            <path d="M120,214 l16,-4 l16,4 l-2,10 l-28,0 z" /><path d="M160,212 l12,-3 l12,3 l-1,9 l-22,0 z" />
          </g>
        </>
      )}
      {scene === "canal" && (
        <>
          <Sun x={110} y={80} r={30} />
          <Mountains y={190} color={C.sky} peaks={[[0, 70], [110, 120], [200, 60], [290, 130], [380, 80], [470, 110], [560, 50], [640, 90]]} />
          <Mountains y={200} color={C.deep} peaks={[[0, 10], [120, 35], [240, 15], [360, 40], [480, 20], [640, 30]]} />
          <Water y={200} color={C.teal} />
          {/* shoreline and oyster beach */}
          <path d="M0,300 q120,-22 260,-10 t380,-30 L640,360 L0,360 z" fill={C.mist} />
          <g fill={C.pine} opacity="0.7"><circle cx="90" cy="318" r="3" /><circle cx="140" cy="326" r="2.5" /><circle cx="210" cy="316" r="3" /><circle cx="300" cy="322" r="2" /></g>
        </>
      )}
      {scene === "forest" && (
        <>
          <Mountains y={230} color={C.sky} peaks={[[0, 40], [140, 90], [320, 190], [500, 100], [640, 50]]} />
          <path d="M280,110 l40,-70 l40,70 z" fill={C.cream} opacity="0.9" />
          <Mountains y={250} color={C.teal} peaks={[[0, 20], [160, 45], [340, 30], [520, 50], [640, 25]]} />
          <rect x="0" y="250" width="640" height="110" fill={C.pine} />
          <Trees y={300} count={18} color={C.charcoal} />
          <Trees y={340} count={12} color={C.pine} />
        </>
      )}
      {scene === "hero" && (
        <>
          <Sun x={500} y={90} r={34} />
          <Mountains y={210} color={C.sky} peaks={[[0, 50], [100, 110], [210, 70], [320, 170], [430, 90], [540, 120], [640, 60]]} />
          <path d="M290,120 l30,-80 l30,80 z" fill={C.cream} opacity="0.85" />
          <Mountains y={230} color={C.deep} peaks={[[0, 25], [150, 55], [320, 30], [480, 60], [640, 35]]} />
          <Water y={230} color={C.teal} />
          <Trees y={250} count={22} color={C.charcoal} />
        </>
      )}
    </svg>
  );
}
