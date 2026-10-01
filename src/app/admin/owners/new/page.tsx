import type { Metadata } from "next";
import OwnerForm from "@/components/admin/OwnerForm";
import { Notice, PageHeader } from "@/components/admin/ui";
import { saveOwnerAction } from "@/app/admin/actions";

export const metadata: Metadata = { title: "New owner" };

export default async function NewOwner({ searchParams }: PageProps<"/admin/owners/new">) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Owners" title="New owner" intro="Add the owner before their homes. They set up Stripe payouts themselves from the owner portal." />
      <Notice searchParams={sp} />
      <OwnerForm action={saveOwnerAction.bind(null, null)} />
    </>
  );
}
