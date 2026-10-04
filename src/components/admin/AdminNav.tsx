"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/calendar", "Calendar"],
  ["/admin/bookings", "Bookings"],
  ["/admin/cleaning", "Cleaning"],
  ["/admin/properties", "Properties"],
  ["/admin/owners", "Owners"],
  ["/admin/accounting", "Accounting"],
  ["/admin/reviews", "Reviews"],
  ["/admin/settings/integrations", "Integrations"],
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex min-w-0 flex-wrap gap-1 pb-1 md:flex-col md:flex-nowrap">
      {nav.map(([href, label]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
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
