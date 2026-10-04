import Link from "next/link";
import type { Property } from "@/lib/data";

// "Book on Airbnb / Vrbo" buttons. The site takes no bookings or payments:
// every reservation is made on the platform listing. Opens in a new tab.
type Props = { p: Pick<Property, "name" | "airbnbUrl" | "vrboUrl">; size?: "md" | "lg"; tone?: "light" | "dark"; className?: string };

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

export function hasBookingLink(p: Pick<Property, "airbnbUrl" | "vrboUrl">) {
  return Boolean(p.airbnbUrl || p.vrboUrl);
}

export default function BookOn({ p, size = "md", tone = "light", className = "" }: Props) {
  const pad = size === "lg" ? "px-6 py-3.5 text-sm" : "px-5 py-2.5 text-[0.8rem]";
  const primary = tone === "dark" ? "bg-cream text-ink hover:bg-white" : "bg-deep text-white hover:bg-dusk";
  const secondary = tone === "dark" ? "border border-cream/70 text-cream hover:bg-cream/10" : "border border-deep text-deep hover:bg-deep hover:text-white";
  const base = `ui inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition ${pad}`;

  if (!hasBookingLink(p)) {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        <Link href="/contact" className={`${base} ${primary}`}>Ask about this home</Link>
      </div>
    );
  }
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {p.airbnbUrl && (
        <a href={p.airbnbUrl} target="_blank" rel="noopener noreferrer" className={`${base} ${primary}`} aria-label={`Book ${p.name} on Airbnb (opens in a new tab)`}>
          Book on Airbnb <Arrow />
        </a>
      )}
      {p.vrboUrl && (
        <a href={p.vrboUrl} target="_blank" rel="noopener noreferrer" className={`${base} ${p.airbnbUrl ? secondary : primary}`} aria-label={`Book ${p.name} on Vrbo (opens in a new tab)`}>
          Book on Vrbo <Arrow />
        </a>
      )}
    </div>
  );
}
