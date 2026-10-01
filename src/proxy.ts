import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { previewRole } from "@/lib/auth";

// Routes that need a signed-in user. /admin additionally needs the admin role
// here; the route layouts and pages re-check with requireRole() (a layout alone
// is skipped on partial renders, so it must never be the only gate).
const isProtected = createRouteMatcher(["/owner(.*)", "/admin(.*)", "/clean(.*)"]);
const isAdmin = createRouteMatcher(["/admin(.*)"]);

// PREVIEW_ROLE (never in production) lets preview deployments open the portals
// without signing in; see previewRole() in src/lib/auth.ts for the env rules.
const previewBypass = previewRole() !== null;

const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

// Roles live in Clerk publicMetadata.role. If the session token is customised to
// include it (Clerk dashboard -> Sessions -> Customize session token, e.g.
// {"metadata": "{{user.public_metadata}}"}) it is read from the claims; otherwise
// fall back to the Backend API.
function roleFromClaims(claims: Record<string, unknown> | null | undefined): unknown {
  for (const key of ["metadata", "publicMetadata", "public_metadata"]) {
    const bag = claims?.[key];
    if (bag && typeof bag === "object" && "role" in bag) return (bag as { role?: unknown }).role;
  }
  return undefined;
}

const withClerk = clerkMiddleware(async (auth, req) => {
  if (!isProtected(req) || previewBypass) return;
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  if (isAdmin(req)) {
    let role = roleFromClaims(sessionClaims as Record<string, unknown> | null);
    if (role === undefined) {
      const user = await (await clerkClient()).users.getUser(userId);
      role = user.publicMetadata?.role;
    }
    if (role !== "admin") return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
});

// Without Clerk keys (early previews) the site must still render: public pages
// pass through; portals are handled by requireRole(), which shows a setup notice.
export default clerkConfigured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
