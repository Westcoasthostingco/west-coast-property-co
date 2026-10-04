"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/clean", label: "Today", match: (p: string) => p === "/clean" || p.startsWith("/clean/jobs") },
  { href: "/clean/calendar", label: "Calendar", match: (p: string) => p.startsWith("/clean/calendar") },
  { href: "/clean/standards", label: "Standards", match: (p: string) => p.startsWith("/clean/standards") },
];

export default function CleanTabs() {
  const pathname = usePathname() ?? "/clean";
  return (
    <nav aria-label="Cleaner portal" className="sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-stretch px-4">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`ui flex min-h-[48px] flex-1 items-center justify-center border-b-2 text-base font-medium transition-colors ${active ? "border-deep text-deep" : "border-transparent text-muted hover:text-charcoal"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
