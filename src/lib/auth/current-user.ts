import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
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

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const devUser = getDevUser();
  if (devUser) return devUser;

  const { data: session } = await auth.getSession();
  return session?.user ?? null;
});

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}
