import type { Metadata } from "next";
import Link from "next/link";
import PropertyImage from "@/components/PropertyImage";
import { DataTable, LinkButton, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { getAllProperties, getBookings, getOwners, money, nameMap } from "@/lib/data";
import { todayISO } from "@/lib/admin";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminProperties({ searchParams }: PageProps<"/admin/properties">) {
  const sp = await searchParams;
  const [props, owners, bookings] = await Promise.all([getAllProperties(), getOwners(), getBookings()]);
  const ownerName = nameMap(owners);
  const today = todayISO();
  const next = (pid: string) => bookings.filter((b) => b.propertyId === pid && b.status !== "cancelled" && b.checkIn >= today).sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
  return (
    <>
      <PageHeader eyebrow="Portfolio" title="Properties" intro={`${props.length} homes under management`} actions={<LinkButton href="/admin/properties/new">+ New home</LinkButton>} />
      <Notice searchParams={sp} />
      <DataTable head={["Home", "Location", "Owner", "Sleeps", "Nightly", "Cleaning", "Rating", "Next stay"]}
        rows={props.map((p) => {
          const n = next(p.id);
          return [
            <Link key="n" href={`/admin/properties/${p.id}`} className="flex items-center gap-3 font-medium text-charcoal hover:text-teal">
              <PropertyImage slug={p.slug} name={p.name} className="h-9 w-12 rounded-lg" />{p.name}
            </Link>,
            `${p.city}, ${p.region}`, ownerName(p.ownerId), `${p.guests} · ${p.bedrooms}bd ${p.bathrooms}ba`, money(p.nightlyRate), money(p.cleaningFee),
            p.reviewCount ? `${p.rating.toFixed(1)} (${p.reviewCount})` : "—",
            n ? <span key="s">{n.checkIn} <Pill value={n.status} /></span> : <span key="s" className="text-muted">none</span>,
          ];
        })} />
    </>
  );
}
