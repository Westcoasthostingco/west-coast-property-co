// Hero number with a quiet label and an optional delta line. No plot.
export default function StatTile({ label, value, delta, hint }: { label: string; value: string; delta?: { value: number; suffix?: string }; hint?: string }) {
  const up = delta && delta.value > 0, down = delta && delta.value < 0;
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="caps-tight text-[0.65rem] text-sky">{label}</p>
      <p className="display mt-2 text-4xl not-italic text-charcoal">{value}</p>
      {delta && (
        <p className={`ui mt-1 text-xs ${up ? "text-teal-dark" : down ? "text-charcoal" : "text-muted"}`}>
          {up ? "▲" : down ? "▼" : "—"} {Math.abs(delta.value)}{delta.suffix ?? "%"} vs last month
        </p>
      )}
      {hint && <p className="ui mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
