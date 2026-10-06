"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type LightboxItem = { src: string; alt: string; caption?: string };

// Full-screen photo viewer. A scroll-snap track gives native swiping on phones;
// arrows and the keyboard move one photo at a time on desktop.
export default function Lightbox({ items, index, name, onClose }: { items: LightboxItem[]; index: number; name: string; onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(index);

  // Jump to the opening photo before the first paint, and lock page scroll while open.
  useEffect(() => {
    const el = track.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "instant" as ScrollBehavior });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [index]);

  const go = useCallback((delta: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.min(items.length - 1, Math.max(0, current + delta));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, [current, items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const onScroll = () => {
    const el = track.current;
    if (el) setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  const item = items[current] ?? items[0];
  const btn = "ui absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-30 sm:flex";

  return (
    <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-50 flex flex-col bg-ink text-white">
      <div className="ui flex items-center justify-between px-4 py-3 text-sm sm:px-6">
        <span className="tabular-nums text-white/80">{current + 1} / {items.length}</span>
        <button type="button" onClick={onClose} autoFocus className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-label="Close photos">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <button type="button" onClick={() => go(-1)} disabled={current === 0} className={`${btn} left-4`} aria-label="Previous photo">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l-6 6 6 6" /></svg>
        </button>
        <button type="button" onClick={() => go(1)} disabled={current === items.length - 1} className={`${btn} right-4`} aria-label="Next photo">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4l6 6-6 6" /></svg>
        </button>
        <div ref={track} onScroll={onScroll} className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain" style={{ scrollbarWidth: "none" }}>
          {items.map((it, i) => (
            <div key={it.src} className="relative h-full w-full shrink-0 snap-center">
              <Image src={it.src} alt={it.alt} fill sizes="100vw" className="object-contain" priority={Math.abs(i - index) <= 1} />
            </div>
          ))}
        </div>
      </div>

      <p className="ui min-h-[3rem] px-4 py-3 text-center text-sm text-white/80 sm:px-6">{item?.caption ?? ""}</p>
    </div>
  );
}
