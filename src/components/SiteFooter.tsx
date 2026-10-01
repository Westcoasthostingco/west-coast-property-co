import Link from "next/link";
import Wordmark from "./Wordmark";

export default function SiteFooter() {
  return (
    <footer className="bg-dusk text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto_auto]">
        <div>
          <Wordmark reversed href={null} />
          <p className="display mt-4 text-xl text-white/90">Coast to Cascades</p>
          <p className="mt-2 max-w-sm text-sm text-white/75">
            Short-term rental management and co-hosting from Hood Canal to Mount Rainier. Two friends managing real homes we care about.
          </p>
        </div>
        <div className="caps-tight text-[0.7rem] leading-7 text-white/85">
          <p className="text-white/60">Explore</p>
          <Link href="/properties" className="block hover:text-white">Our homes</Link>
          <Link href="/services" className="block hover:text-white">For owners</Link>
          <Link href="/about" className="block hover:text-white">About</Link>
          <Link href="/contact" className="block hover:text-white">Contact</Link>
        </div>
        <div className="text-sm leading-7 text-white/85">
          <p className="caps-tight text-[0.7rem] text-white/60">Reach us</p>
          <a href="mailto:hello@westcoasthostingco.com" className="block hover:text-white">hello@westcoasthostingco.com</a>
          <a href="tel:+12532786818" className="block hover:text-white">253.278.6818</a>
          <a href="tel:+15038608115" className="block hover:text-white">503.860.8115</a>
          <p className="text-white/60">Gig Harbor, Washington</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="caps mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[0.6rem] text-white/60 sm:px-6">
          <span>© {new Date().getFullYear()} West Coast Hosting Co</span>
          <span className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/legal/policies" className="hover:text-white">Policies</Link>
            <Link href="/owner" className="hover:text-white">Owner portal</Link>
            <Link href="/clean" className="hover:text-white">Cleaner</Link>
            <Link href="/admin" className="hover:text-white">Team</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
