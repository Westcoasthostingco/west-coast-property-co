import Link from "next/link";
import { requireRole } from "@/lib/auth";

const nav = [
  ["/admin", "Overview"],
  ["/admin/properties", "Properties"],
  ["/admin/bookings", "Bookings"],
  ["/admin/owners", "Owners"],
  ["/admin/payouts", "Payouts"],
  ["/admin/reviews", "Reviews"],
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole("admin");
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[180px_1fr]">
      <nav className="flex gap-3 text-sm md:flex-col">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className="text-muted hover:text-foreground">{label}</Link>
        ))}
      </nav>
      <main className="space-y-6">{children}</main>
    </div>
  );
}
