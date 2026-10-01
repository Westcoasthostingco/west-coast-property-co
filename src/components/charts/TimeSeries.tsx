"use client";
import { useState } from "react";

// Single-series line or bar chart for one measure over months. Brand teal only;
// multi-series comparisons use small multiples (one chart per home) instead.
type Point = { label: string; value: number };
type Props = { points: Point[]; kind?: "line" | "bar"; format?: (v: number) => string; height?: number; title: string };

export default function TimeSeries({ points, kind = "line", format = (v) => String(v), height = 180, title }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 600, h = height, padL = 8, padR = 8, padT = 16, padB = 24;
  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length;
  const x = (i: number) => padL + (n > 1 ? (i * (w - padL - padR)) / (n - 1) : (w - padL - padR) / 2);
  const y = (v: number) => padT + (1 - v / max) * (h - padT - padB);
  const barW = Math.max(6, ((w - padL - padR) / n) * 0.6);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const last = n - 1;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} className="w-full overflow-visible"
        onMouseLeave={() => setHover(null)}>
        {/* recessive grid */}
        {[0.5, 1].map((f) => <line key={f} x1={padL} x2={w - padR} y1={y(max * f)} y2={y(max * f)} stroke="#dde9ed" strokeWidth={1} />)}
        <line x1={padL} x2={w - padR} y1={y(0)} y2={y(0)} stroke="#dde9ed" strokeWidth={1} />
        {kind === "line" ? (
          <>
            <path d={path} fill="none" stroke="#6ba8bc" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(p.value)} r={hover === i || i === last ? 4 : 0} fill="#6ba8bc" stroke="#fbfdfc" strokeWidth={2} />
            ))}
          </>
        ) : (
          points.map((p, i) => {
            const bh = y(0) - y(p.value);
            return <rect key={i} x={x(i) - barW / 2} y={y(p.value)} width={barW} height={bh} rx={4} fill={hover === i ? "#5a93a6" : "#6ba8bc"} />;
          })
        )}
        {/* hit targets larger than marks */}
        {points.map((p, i) => (
          <rect key={`h${i}`} x={x(i) - (w / n) / 2} y={0} width={w / n} height={h} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={y(0)} stroke="#a8d0dc" strokeWidth={1} strokeDasharray="3 3" />}
        {points.map((p, i) => (
          <text key={`l${i}`} x={x(i)} y={h - 6} textAnchor="middle" className="fill-[#6b777c]" fontSize={11} fontFamily="var(--font-poppins)">{p.label}</text>
        ))}
        {/* selective direct label: latest point only */}
        {n > 0 && hover === null && (
          <text x={x(last)} y={y(points[last].value) - 10} textAnchor="end" fontSize={12} fontFamily="var(--font-poppins)" className="fill-[#3a4448]">{format(points[last].value)}</text>
        )}
      </svg>
      {hover !== null && (
        <div className="ui pointer-events-none absolute -top-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs shadow"
          style={{ left: `${(x(hover) / w) * 100}%`, transform: "translateX(-50%)" }}>
          <span className="text-muted">{points[hover].label}</span> <span className="font-medium text-charcoal">{format(points[hover].value)}</span>
        </div>
      )}
      <figcaption className="sr-only">{title}: {points.map((p) => `${p.label} ${format(p.value)}`).join(", ")}</figcaption>
    </figure>
  );
}
