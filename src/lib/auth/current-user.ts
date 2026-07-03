import "server-only";
import { auth } from "@/lib/auth/server";

export type CurrentUser = { id: string; email: string; name: string };

function getDevUser(): CurrentUser | null {
  if (process.env.NODE_ENV === "production") return null;
  if (process.env.DEV_SKIP_AUTH !== "true") return null;
  if (!process.env.DEV_USER_ID || !process.env.DEV_USER_EMAIL) return null;

  return {
    id: process.env.DEV_USER_ID,
    email: process.env.DEV_USER_EMAIL,
    name: process.env.DEV_USER_NAME || "Dev",
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const devUser = getDevUser();
  if (devUser) return devUser;

  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}
