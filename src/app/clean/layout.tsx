import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import CleanTabs from "@/components/clean/CleanTabs";

export const metadata: Metadata = { title: "My jobs" };

// Cleaners (and admins) only. Signed-out users are sent to sign-in by
// requireRole; wrong roles land on /unauthorized.
export default async function CleanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("cleaner");
  return (
    <div className="ui min-h-full bg-cream text-charcoal">
      <CleanTabs />
      <main className="mx-auto w-full max-w-xl px-4 pb-32 pt-6">{children}</main>
    </div>
  );
}
