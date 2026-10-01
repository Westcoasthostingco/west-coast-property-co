import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">About West Coast Property Co</h1>
      <p className="mt-4 text-muted">
        Placeholder copy: tell the company story, service area and team here.
      </p>
    </main>
  );
}
