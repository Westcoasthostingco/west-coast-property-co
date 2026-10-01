"use client";
import { useState } from "react";
import Link from "next/link";

// Hamburger menu for phones. The links are the same as the desktop nav.
export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)} className="flex h-11 w-11 items-center justify-center rounded-full text-deep">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {open ? <path d="M4 4l14 14M18 4L4 18" /> : <path d="M3 6h16M3 11h16M3 16h16" />}
        </svg>
      </button>
      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-cream px-4 py-3 shadow-lg shadow-dusk/10">
          <ul className="caps-tight divide-y divide-line text-[0.75rem] text-charcoal">
            {links.map((l) => (
              <li key={l.href}><Link href={l.href} onClick={() => setOpen(false)} className="block py-3.5 hover:text-deep">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
