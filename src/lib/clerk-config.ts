// Edge-safe check (no Clerk imports) that both Clerk keys are present and
// well-formed. A malformed key makes clerkMiddleware and ClerkProvider throw on
// every request, which takes the whole site down with a bare "Internal Server
// Error". Treating a bad key as "not configured" keeps public pages up and
// shows the portals' setup notice instead.
//
// A publishable key is "pk_test_" or "pk_live_" followed by base64 of
// "<frontend-api-host>$".
function validPublishableKey(key: string | undefined): boolean {
  if (!key) return false;
  const m = /^pk_(?:test|live)_([A-Za-z0-9+/=_-]+)$/.exec(key.trim());
  if (!m) return false;
  try {
    const host = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
    return host.endsWith("$") && host.includes(".");
  } catch {
    return false;
  }
}

function validSecretKey(key: string | undefined): boolean {
  return Boolean(key && /^sk_(?:test|live)_\S{10,}$/.test(key.trim()));
}

export const clerkConfigured =
  validPublishableKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && validSecretKey(process.env.CLERK_SECRET_KEY);

if (!clerkConfigured && (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_SECRET_KEY)) {
  console.error("[clerk] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY is missing or malformed in this environment; running without Clerk.");
}
