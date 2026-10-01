import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line text-sm text-muted">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8">
        <p>© {new Date().getFullYear()} West Coast Property Co</p>
        <Link href="/admin" className="hover:text-foreground">Team sign-in</Link>
      </div>
    </footer>
  );
}
