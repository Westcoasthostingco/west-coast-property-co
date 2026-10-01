import Link from "next/link";

export default async function Unauthorized({ searchParams }: PageProps<"/unauthorized">) {
  const setup = (await searchParams).reason === "setup";
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="display text-4xl text-teal">{setup ? "Sign-in isn't set up yet" : "No access to this area"}</h1>
      <p className="mt-3 text-muted">
        {setup
          ? "The portals open once Clerk keys are added to the deployment. For a preview without sign-in, set PREVIEW_ROLE."
          : "Your account does not have the right role yet. Ask the West Coast Hosting Co team to set it up."}
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2 text-white">Back home</Link>
    </main>
  );
}
