import Link from "next/link";
import CoastToCascades from "@/components/art/CoastToCascades";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-5xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="caps text-xs text-deep">Lost at sea</p>
        <h1 className="display mt-2 text-5xl text-charcoal">That page drifted off.</h1>
        <p className="mt-4 text-lg text-muted">The link may be old, or the page moved. The homes are all still here.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/properties" className="caps-tight rounded-full bg-deep px-6 py-3 text-[0.7rem] text-white hover:bg-dusk">See the homes</Link>
          <Link href="/" className="caps-tight rounded-full border border-deep px-6 py-3 text-[0.7rem] text-deep hover:bg-deep hover:text-white">Back home</Link>
        </div>
      </div>
      <CoastToCascades className="w-full rounded-3xl" />
    </main>
  );
}
