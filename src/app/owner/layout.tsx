import type { Metadata } from "next";
import type { ReactNode } from "react";
import OwnerNav from "@/components/owner/OwnerNav";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: { default: "Owner portal", template: "%s | Owner portal | West Coast Hosting Co" } };

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireRole("owner");
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[180px_1fr] print:block print:max-w-none print:py-0">
      <aside className="min-w-0 md:sticky md:top-20 md:self-start print:hidden">
        <OwnerNav />
      </aside>
      <main className="min-w-0 space-y-8">{children}</main>
    </div>
  );
}
