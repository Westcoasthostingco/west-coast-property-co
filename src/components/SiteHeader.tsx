import Link from "next/link";

const links = [
  { href: "/properties", label: "Stay with us" },
  { href: "/services", label: "Owner services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-line bg-background/90 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight text-brand">
          West Coast Property Co
        </Link>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/owner" className="rounded-full bg-brand px-4 py-1.5 text-white hover:bg-brand-dark">
            Owner login
          </Link>
        </nav>
      </div>
    </header>
  );
}
