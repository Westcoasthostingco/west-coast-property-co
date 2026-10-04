import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Wordmark from "./Wordmark";
import MobileNav from "./MobileNav";
import { clerkConfigured, getRole } from "@/lib/auth";

const publicLinks = [
  { href: "/properties", label: "Homes" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const portalFor = { admin: { href: "/admin", label: "Admin" }, owner: { href: "/owner", label: "Owner portal" }, cleaner: { href: "/clean", label: "My jobs" } };

export default async function SiteHeader() {
  const role = await getRole().catch(() => null);
  // Decide signed-in state on the server. Signed-out visitors see no sign-in
  // button: portals are invitation-only and reached from the footer link.
  const userId = clerkConfigured ? await auth().then((a) => a.userId).catch(() => null) : null;
  const portal = role ? portalFor[role] : null;
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Wordmark />
        <nav className="caps-tight flex items-center gap-3 text-[0.7rem] text-charcoal/80 sm:gap-5" aria-label="Main">
          {publicLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hidden hover:text-deep sm:inline">{l.label}</Link>
          ))}
          <MobileNav links={publicLinks} />
          {clerkConfigured ? (
            <>
              {!userId ? null : (
                <>
                  {portal ? (
                    <a href={portal.href} className="rounded-full bg-deep px-4 py-1.5 text-white hover:bg-dusk">{portal.label}</a>
                  ) : (
                    // Signed in but no role yet: explain instead of hiding the portals.
                    <a href="/unauthorized" className="rounded-full border border-deep px-4 py-1.5 text-deep hover:bg-deep hover:text-white">Portal</a>
                  )}
                  <UserButton />
                </>
              )}
            </>
          ) : portal ? (
            <a href={portal.href} className="rounded-full bg-deep px-4 py-1.5 text-white hover:bg-dusk">{portal.label}</a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
