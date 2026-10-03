import { NextResponse } from "next/server";
import { clerkConfigured } from "@/lib/clerk-config";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/health
// Reports which services this deployment is configured for and whether the
// database answers. Booleans and short status strings only; never key values.
export async function GET() {
  const env = (k: string) => Boolean(process.env[k]);
  let database = "not configured";
  if ((env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_URL")) && (env("SUPABASE_SERVICE_ROLE_KEY") || env("SUPABASE_SECRET_KEY"))) {
    try {
      const { error } = await supabaseAdmin().from("properties").select("id", { count: "exact", head: true });
      database = error ? `error ${error.code ?? ""}`.trim() : "ok";
    } catch (e) {
      database = (e as Error).name === "TimeoutError" ? "timeout" : "unreachable";
    }
  }
  return NextResponse.json({
    environment: process.env.VERCEL_ENV ?? "local",
    clerk: clerkConfigured ? "configured" : env("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") || env("CLERK_SECRET_KEY") ? "keys malformed or incomplete" : "not configured",
    supabase: {
      publicSiteUsesDatabase: supabaseConfigured,
      NEXT_PUBLIC_SUPABASE_URL: env("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: env("SUPABASE_SERVICE_ROLE_KEY"),
      database,
    },
    stripe: {
      STRIPE_SECRET_KEY: env("STRIPE_SECRET_KEY"),
      STRIPE_WEBHOOK_SECRET: env("STRIPE_WEBHOOK_SECRET"),
      STRIPE_CONNECT_WEBHOOK_SECRET: env("STRIPE_CONNECT_WEBHOOK_SECRET"),
    },
    CRON_SECRET: env("CRON_SECRET"),
    // Names (never values) of related variables this deployment can see, to
    // catch typos or a missing Production tick in Vercel.
    variableNamesSeen: Object.keys(process.env).filter((k) => /SUPABASE|STRIPE|CLERK|CRON/i.test(k)).sort(),
  }, { headers: { "Cache-Control": "no-store" } });
}
