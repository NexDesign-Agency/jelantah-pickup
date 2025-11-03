import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error("Forbidden: Insufficient permissions");
  }
  return user;
}

