import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: { template: "%s · Admin · West Coast Hosting Co", default: "Admin · West Coast Hosting Co" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireRole("admin");
  return (
    <div className="mx-auto grid max-w-7xl gap-6 bg-cream px-4 py-6 sm:px-6 md:grid-cols-[170px_1fr] md:gap-8 md:py-10">
      <aside className="min-w-0 md:sticky md:top-20 md:self-start">
        <p className="caps mb-2 hidden text-[0.6rem] text-deep md:block">Back office</p>
        <AdminNav />
      </aside>
      <main className="min-w-0 space-y-6">{children}</main>
    </div>
  );
}
