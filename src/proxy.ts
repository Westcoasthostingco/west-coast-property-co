import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that need a signed-in user. Role checks (admin vs owner) happen in
// the route layouts via requireRole(), which can read the user's metadata.
const isProtected = createRouteMatcher(["/owner(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
