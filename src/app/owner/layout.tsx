import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Owner portal", template: "%s | Owner portal | West Coast Hosting Co" } };

const nav = [
  ["/owner", "Overview"],
  ["/owner/properties", "Properties"],
  ["/owner/statements", "Statements"],
  ["/owner/invoices", "Invoices"],
  ["/owner/settings", "Settings"],
] as const;

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireRole("owner");
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[180px_1fr] print:block print:max-w-none print:py-0">
      <nav aria-label="Owner portal" className="caps-tight -mx-4 flex gap-5 overflow-x-auto px-4 text-[0.7rem] text-muted md:mx-0 md:flex-col md:gap-3 md:px-0 print:hidden">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap py-1 transition hover:text-teal">{label}</Link>
        ))}
      </nav>
      <main className="min-w-0 space-y-8">{children}</main>
    </div>
  );
}
