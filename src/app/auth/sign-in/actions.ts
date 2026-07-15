"use server";

import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
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
    // Owner db here, not getUserDb(): auth.token() would hit the same same-request
    // cookie race as auth.getSession() right after signIn.email() (see decisions.md).
    await seedDefaultCategoriesIfMissing(db, data.user.id);
  }

  redirect("/dashboard");
}
