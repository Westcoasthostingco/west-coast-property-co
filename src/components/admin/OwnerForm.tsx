import { Card, Field, buttonClass, inputClass } from "@/components/admin/ui";
import type { OwnerDetail } from "@/lib/admin";

export default function OwnerForm({ owner: o, action }: { owner?: OwnerDetail; action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="space-y-4">
      <Card title="Owner">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input name="name" required defaultValue={o?.name} className={inputClass} /></Field>
          <Field label="Email" hint="Their Clerk sign-in is linked by this email on first login"><input name="email" type="email" required defaultValue={o?.email} className={inputClass} /></Field>
          <Field label="Management fee (%)" hint="Of the nights subtotal; a home can override"><input name="feePercent" type="number" min={0} max={100} step={0.5} required defaultValue={o?.feePercent ?? 18} className={inputClass} /></Field>
          <Field label="Fixed management fee per stay ($)" hint="Charged on every guest stay, on top of the percentage; a home can override"><input name="fixedFee" type="number" min={0} step={0.01} inputMode="decimal" defaultValue={o ? o.fixedFeeCents / 100 : 0} className={inputClass} /></Field>
          <Field label="Clerk user id" hint="user_… from the Clerk dashboard. Blank until they sign up."><input name="clerkUserId" defaultValue={o?.clerkUserId ?? ""} placeholder="user_2x…" className={inputClass} /></Field>
        </div>
      </Card>
      <div className="flex justify-end"><button type="submit" className={buttonClass}>{o ? "Save changes" : "Create owner"}</button></div>
    </form>
  );
}
