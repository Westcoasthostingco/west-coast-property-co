import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

// POST /api/webhooks/clerk  (event: user.created)
// Links a new Clerk user to an existing owner or cleaner row by email, so the
// portal works the first time they sign in. Needs CLERK_WEBHOOK_SIGNING_SECRET.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (e) {
    return NextResponse.json({ error: `Bad signature: ${(e as Error).message}` }, { status: 400 });
  }
  if (evt.type !== "user.created" || !supabaseConfigured) return NextResponse.json({ received: true });

  const email = evt.data.email_addresses?.[0]?.email_address?.toLowerCase();
  if (!email) return NextResponse.json({ received: true });

  const db = supabaseAdmin();
  const [{ data: owner }, { data: cleaner }] = await Promise.all([
    db.from("owners").update({ clerk_user_id: evt.data.id }).eq("email", email).is("clerk_user_id", null).select("id").maybeSingle(),
    db.from("cleaners").update({ clerk_user_id: evt.data.id }).eq("email", email).is("clerk_user_id", null).select("id").maybeSingle(),
  ]);
  // Role is still set in Clerk publicMetadata by an admin; linking only maps the row.
  return NextResponse.json({ received: true, linked: owner ? "owner" : cleaner ? "cleaner" : null });
}
