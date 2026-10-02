import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Wordmark from "./Wordmark";
import MobileNav from "./MobileNav";
import { clerkConfigured, getRole } from "@/lib/auth";

const publicLinks = [
  { href: "/properties", label: "Stay" },
  { href: "/services", label: "Owners" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const portalFor = { admin: { href: "/admin", label: "Admin" }, owner: { href: "/owner", label: "Owner portal" }, cleaner: { href: "/clean", label: "My jobs" } };

export default async function SiteHeader() {
  const role = await getRole().catch(() => null);
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
              <Show when="signed-out">
                <SignInButton mode="modal" forceRedirectUrl="/owner">
                  <button className="rounded-full border border-deep px-4 py-1.5 text-deep transition hover:bg-deep hover:text-white">Sign in</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                {portal ? (
                  <a href={portal.href} className="rounded-full bg-deep px-4 py-1.5 text-white hover:bg-dusk">{portal.label}</a>
                ) : (
                  // Signed in but no role yet: explain instead of hiding the portals.
                  <a href="/unauthorized" className="rounded-full border border-deep px-4 py-1.5 text-deep hover:bg-deep hover:text-white">Portal</a>
                )}
                <UserButton />
              </Show>
            </>
          ) : portal ? (
            <a href={portal.href} className="rounded-full bg-deep px-4 py-1.5 text-white hover:bg-dusk">{portal.label}</a>
          ) : (
            <Link href="/sign-in" className="rounded-full border border-deep px-4 py-1.5 text-deep transition hover:bg-deep hover:text-white">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
