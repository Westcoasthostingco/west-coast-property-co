export default function SectionHeading({ eyebrow, title, intro, align = "left" }: { eyebrow: string; title: string; intro?: string; align?: "left" | "center" }) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="caps text-xs text-sky">{eyebrow}</p>
      <h2 className={`display mt-2 text-4xl text-charcoal sm:text-5xl ${center ? "wave" : "wave wave-left"}`}>{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}
