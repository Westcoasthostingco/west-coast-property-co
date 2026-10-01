import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "admin" | "owner" | "cleaner";

// Roles live in Clerk user publicMetadata: { "role": "admin" | "owner" | "cleaner" }.
// Set them in the Clerk dashboard (Users -> Metadata) or via the Backend API.
export async function getRole(): Promise<Role | null> {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  return role === "admin" || role === "owner" || role === "cleaner" ? role : null;
}

// Redirects to sign-in when signed out, and to /unauthorized when the role
// does not match. Admins may open every area.
export async function requireRole(...allowed: Role[]) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const role = await getRole();
  if (role !== "admin" && (!role || !allowed.includes(role))) redirect("/unauthorized");
  return { userId, role: role as Role };
}
