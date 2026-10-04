import { NextResponse } from "next/server";
import { clerkConfigured } from "@/lib/clerk-config";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/health
// Reports which services this deployment is configured for and whether the
// database answers. Booleans and short status strings only; never key values.
// The publishable key is public (it is embedded in every page); decoding it
// shows which Clerk instance and browser script host the site uses.
function clerkInstance() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const m = pk && /^pk_(test|live)_(.+)$/.exec(pk);
  if (!m) return null;
  let frontendApi = "unreadable";
  try { frontendApi = atob(m[2]).replace(/\$$/, ""); } catch {}
  return { mode: m[1] === "live" ? "production" : "development", frontendApi };
}

// Shape of the Clerk secret key without revealing it: which known prefix it
// starts with (prefixes are not secret), its length, and stray characters.
function secretKeyShape() {
  const raw = process.env.CLERK_SECRET_KEY;
  if (raw === undefined) return null;
  const prefixes = ["sk_live_", "sk_test_", "pk_live_", "pk_test_", "whsec_", "sb_secret_", "sk_"];
  const t = raw.trim();
  return {
    startsWith: prefixes.find((p) => t.startsWith(p)) ?? "unknown",
    length: raw.length,
    hasSpacesOrLineBreaks: /\s/.test(raw),
    hasQuotes: /["'`]/.test(raw),
  };
}

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
    clerkInstance: clerkInstance(),
    clerkSecretKeyShape: secretKeyShape(),
    supabase: {
      publicSiteUsesDatabase: supabaseConfigured,
      NEXT_PUBLIC_SUPABASE_URL: env("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: env("SUPABASE_SERVICE_ROLE_KEY"),
      database,
    },
    CRON_SECRET: env("CRON_SECRET"),
    // Names (never values) of related variables this deployment can see, to
    // catch typos or a missing Production tick in Vercel.
    variableNamesSeen: Object.keys(process.env).filter((k) => /SUPABASE|CLERK|CRON/i.test(k)).sort(),
  }, { headers: { "Cache-Control": "no-store" } });
}
