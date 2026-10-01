import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";
import { appUrl, stripe } from "@/lib/stripe";

// POST /api/stripe/connect/onboard
// Creates the owner's Connect Express account on first call, then sends them to
// Stripe's hosted onboarding. Stripe collects identity, bank details and tax info.
export async function POST() {
  const { userId } = await requireRole("owner");
  if (!supabaseConfigured) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const db = supabaseAdmin();
  const { data: owner, error } = await db
    .from("owners").select("id, email, name, stripe_account_id").eq("clerk_user_id", userId).single();
  if (error || !owner) return NextResponse.json({ error: "No owner record" }, { status: 404 });

  let accountId: string = owner.stripe_account_id;
  if (!accountId) {
    const account = await stripe().accounts.create({
      type: "express",
      country: "US",
      email: owner.email,
      capabilities: { transfers: { requested: true } },
      business_profile: { product_description: "Short-term rental income managed by West Coast Hosting Co" },
      metadata: { owner_id: owner.id },
    });
    accountId = account.id;
    await db.from("owners").update({ stripe_account_id: accountId }).eq("id", owner.id);
  }

  const link = await stripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${appUrl()}/api/stripe/connect/onboard`,
    return_url: `${appUrl()}/owner?onboarding=done`,
  });
  return NextResponse.redirect(link.url, { status: 303 });
}

// Stripe sends the owner back here (GET) when an onboarding link expires.
export const GET = POST;
