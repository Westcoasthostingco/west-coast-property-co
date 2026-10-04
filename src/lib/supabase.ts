import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { clerkConfigured } from "@/lib/auth";

// Primary names first, then the names Supabase's dashboard and Vercel
// integration use for the newer publishable/secret keys.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Every Supabase call gives up after 10 seconds, so a network problem shows an
// error page instead of leaving a click hanging with no feedback.
const timedFetch: typeof fetch = (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(10_000) });

// Plain anon client for public pages (listings, published reviews, availability).
// It never touches the Clerk session, so it works at build time (static params,
// metadata) and shows signed-in visitors the same public data as everyone else.
export function supabasePublic(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase env vars are not set");
  return createClient(url, anonKey, { auth: { persistSession: false }, global: { fetch: timedFetch } });
}

// Per-request client that forwards the Clerk session token, so Supabase row
// level security sees the signed-in user (auth.jwt()->>'sub' = Clerk user id).
// Requires Clerk to be added as a third-party auth provider in Supabase.
// Without Clerk keys auth() throws (no clerkMiddleware ran), so public reads
// fall back to a plain anon client.
export function supabaseForUser(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase env vars are not set");
  if (!clerkConfigured) return createClient(url, anonKey, { auth: { persistSession: false }, global: { fetch: timedFetch } });
  return createClient(url, anonKey, {
    accessToken: async () => (await auth()).getToken(),
    global: { fetch: timedFetch },
  });
}

// Server-only client that bypasses RLS. Use for admin pages, webhooks and
// background jobs. Never import this into a client component.
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, { auth: { persistSession: false }, global: { fetch: timedFetch } });
}
