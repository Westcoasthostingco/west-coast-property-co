import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "admin" | "owner" | "cleaner";

// True once both Clerk keys are present. Without them the public site still
// works; the portals show a "not set up yet" page instead of crashing.
export const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

// Preview-only bypass so Vercel Preview deployments can show the portals before
// Clerk is configured. Honoured only on a Vercel preview/development deployment
// or a non-production local build; never when VERCEL_ENV is "production", and
// never for a production build outside Vercel (NODE_ENV=production, VERCEL_ENV unset).
export function previewAllowed(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return false;
  if (vercelEnv === "preview" || vercelEnv === "development") return true;
  return process.env.NODE_ENV !== "production";
}

export function previewRole(): Role | null {
  if (!previewAllowed()) return null;
  const r = process.env.PREVIEW_ROLE;
  return r === "admin" || r === "owner" || r === "cleaner" ? r : null;
}

// Roles live in Clerk user publicMetadata: { "role": "admin" | "owner" | "cleaner" }.
// Set them in the Clerk dashboard (Users -> Metadata) or via the Backend API.
export async function getRole(): Promise<Role | null> {
  const preview = previewRole();
  if (preview) return preview;
  if (!clerkConfigured) return null;
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  return role === "admin" || role === "owner" || role === "cleaner" ? role : null;
}

// Redirects to sign-in when signed out, and to /unauthorized when the role
// does not match. Admins may open every area.
export async function requireRole(...allowed: Role[]) {
  const preview = previewRole();
  if (preview) {
    if (preview !== "admin" && !allowed.includes(preview)) redirect("/unauthorized");
    return { userId: `preview_${preview}`, role: preview };
  }
  if (!clerkConfigured) redirect("/unauthorized?reason=setup");
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const role = await getRole();
  if (role !== "admin" && (!role || !allowed.includes(role))) redirect("/unauthorized");
  return { userId, role: role as Role };
}
