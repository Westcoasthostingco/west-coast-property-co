import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Wordmark from "./Wordmark";
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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Wordmark />
        <nav className="caps-tight flex items-center gap-5 text-[0.7rem] text-charcoal/80">
          {publicLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hidden hover:text-teal sm:inline">{l.label}</Link>
          ))}
          {clerkConfigured ? (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal" forceRedirectUrl="/owner">
                  <button className="rounded-full border border-teal px-4 py-1.5 text-teal transition hover:bg-teal hover:text-white">Sign in</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                {portal && <Link href={portal.href} className="rounded-full bg-teal px-4 py-1.5 text-white hover:bg-teal-dark">{portal.label}</Link>}
                <UserButton />
              </Show>
            </>
          ) : (
            portal && <Link href={portal.href} className="rounded-full bg-teal px-4 py-1.5 text-white hover:bg-teal-dark">{portal.label}</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
