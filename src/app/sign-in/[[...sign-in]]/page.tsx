import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { clerkConfigured } from "@/lib/auth";
import ClerkGate from "@/components/ClerkGate";

export default function SignInPage() {
  if (!clerkConfigured) redirect("/unauthorized?reason=setup");
  return (
    <main className="flex justify-center px-4 py-16">
      <ClerkGate>
        <SignIn fallbackRedirectUrl="/" />
      </ClerkGate>
    </main>
  );
}
