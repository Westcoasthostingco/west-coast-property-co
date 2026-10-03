import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { clerkConfigured } from "@/lib/auth";
import ClerkGate from "@/components/ClerkGate";

export default function SignUpPage() {
  if (!clerkConfigured) redirect("/unauthorized?reason=setup");
  return (
    <main className="flex justify-center px-4 py-16">
      <ClerkGate>
        <SignUp fallbackRedirectUrl="/" />
      </ClerkGate>
    </main>
  );
}
