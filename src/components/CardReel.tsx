"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

type Slide = { src: string; alt: string };

// Swipeable photo reel for a home card. Slides are links to the home; the arrows
// and dots sit outside the links so they never nest interactive elements.
export default function CardReel({ slides, href, name, className = "" }: { slides: Slide[]; href: string; name: string; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const go = (delta: number) => {
    const el = track.current;
    if (!el) return;
    const next = (current + delta + slides.length) % slides.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current;
    if (el) setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };
  const arrow = "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-deep opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-deep group-hover/reel:opacity-100";

  return (
    <div className={`group/reel relative overflow-hidden rounded-2xl ${className}`}>
      <div ref={track} onScroll={onScroll} className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain" style={{ scrollbarWidth: "none" }} aria-label={`${name} photos`}>
        {slides.map((s, i) => (
          <Link key={s.src} href={href} className="relative h-full w-full shrink-0 snap-center" tabIndex={i === 0 ? 0 : -1} aria-label={i === 0 ? name : `${name}, photo ${i + 1}`}>
            <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1536px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" priority={i === 0} />
          </Link>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label="Previous photo">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l-6 6 6 6" /></svg>
          </button>
          <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label="Next photo">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4l6 6-6 6" /></svg>
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {slides.map((s, i) => <span key={s.src} className={`h-1.5 rounded-full bg-white shadow transition-all ${i === current ? "w-4 opacity-100" : "w-1.5 opacity-60"}`} />)}
          </div>
        </>
      )}
    </div>
  );
}
