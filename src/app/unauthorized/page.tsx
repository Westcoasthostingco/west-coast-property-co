import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">No access to this area</h1>
      <p className="mt-2 text-muted">
        Your account does not have the right role yet. Ask the West Coast Property Co team to set it up.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-white">Back home</Link>
    </main>
  );
}
