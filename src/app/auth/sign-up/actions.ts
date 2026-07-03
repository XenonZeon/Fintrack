"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { ru } from "@/lib/i18n/ru";

export async function signUpWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signUp.email({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || ru.signUp.genericError };

  redirect("/auth/verify-email");
}
