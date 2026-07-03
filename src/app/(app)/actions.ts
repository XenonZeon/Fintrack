"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ru } from "@/lib/i18n/ru";

export async function signOut() {
  const { error } = await auth.signOut();
  if (error) throw new Error(error.message || ru.sidebar.signOutError);

  redirect("/auth/sign-in");
}
