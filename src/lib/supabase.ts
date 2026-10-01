import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Per-request client that forwards the Clerk session token, so Supabase row
// level security sees the signed-in user (auth.jwt()->>'sub' = Clerk user id).
// Requires Clerk to be added as a third-party auth provider in Supabase.
export function supabaseForUser(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase env vars are not set");
  return createClient(url, anonKey, {
    accessToken: async () => (await auth()).getToken(),
  });
}

// Server-only client that bypasses RLS. Use for admin pages, webhooks and
// background jobs. Never import this into a client component.
export function supabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
