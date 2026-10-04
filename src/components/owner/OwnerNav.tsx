"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["/owner", "Overview"],
  ["/owner/properties", "Properties"],
  ["/owner/statements", "Statements"],
  ["/owner/invoices", "Invoices"],
  ["/owner/settings", "Settings"],
  ["/owner/terms", "Terms"],
] as const;

// Same pattern as AdminNav: pills with aria-current, wrapping to two rows on a phone.
export default function OwnerNav() {
  const path = usePathname();
  return (
    <nav aria-label="Owner portal" className="flex min-w-0 flex-wrap gap-1 md:flex-col md:flex-nowrap print:hidden">
      {nav.map(([href, label]) => {
        const active = href === "/owner" ? path === "/owner" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`caps-tight rounded-full px-3 py-1.5 text-[0.68rem] transition md:rounded-lg ${active ? "bg-deep text-white" : "text-muted hover:bg-mist hover:text-charcoal"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
