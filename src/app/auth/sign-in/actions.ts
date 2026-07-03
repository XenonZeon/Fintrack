"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { seedDefaultCategoriesIfMissing } from "@/lib/db/queries/categories";
import { ru } from "@/lib/i18n/ru";

export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signIn.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || ru.signIn.genericError };

  const { data: session } = await auth.getSession();
  if (session?.user) {
    await seedDefaultCategoriesIfMissing(session.user.id);
  }

  redirect("/dashboard");
}
