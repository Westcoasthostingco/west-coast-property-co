import type { Metadata } from "next";
import PropertyForm from "@/components/admin/PropertyForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { savePropertyAction } from "@/app/admin/actions";
import { getOwners } from "@/lib/data";
import { getCleaners } from "@/lib/cleaning";

export const metadata: Metadata = { title: "New property" };

export default async function NewProperty({ searchParams }: PageProps<"/admin/properties/new">) {
  const sp = await searchParams;
  const [owners, cleaners] = await Promise.all([getOwners(), getCleaners()]);
  return (
    <>
      <PageHeader eyebrow="Properties" title="New home" intro="Create the listing first; photos and channel feeds can be added after." />
      <Notice searchParams={sp} />
      <PropertyForm owners={owners} cleaners={cleaners} action={savePropertyAction.bind(null, null)} />
    </>
  );
}
