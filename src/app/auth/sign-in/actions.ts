"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { seedDefaultCategoriesIfMissing } from "@/lib/db/queries/categories";
import { ru } from "@/lib/i18n/ru";

export async function signInWithEmail(
  _prev: { error: string } | null,
  formData: FormData
) {
  const { data, error } = await auth.signIn.email({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message || ru.signIn.genericError };

  if (data?.user) {
    await seedDefaultCategoriesIfMissing(data.user.id);
  }

  redirect("/dashboard");
}
