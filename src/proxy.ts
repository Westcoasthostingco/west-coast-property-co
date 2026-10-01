import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that need a signed-in user. Role checks (admin vs owner) happen in
// the route layouts via requireRole(), which can read the user's metadata.
const isProtected = createRouteMatcher(["/owner(.*)", "/admin(.*)", "/clean(.*)"]);

// PREVIEW_ROLE (never in production) lets preview deployments open the portals
// without signing in; see src/lib/auth.ts.
const previewBypass = process.env.VERCEL_ENV !== "production" && ["admin", "owner", "cleaner"].includes(process.env.PREVIEW_ROLE ?? "");

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req) && !previewBypass) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
