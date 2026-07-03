"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithEmail } from "./actions";
import { ru } from "@/lib/i18n/ru";

export default function SignInPage() {
  const [state, formAction, isPending] = useActionState(signInWithEmail, null);

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col items-center justify-center gap-5"
    >
      <h1 className="text-2xl font-semibold text-zinc-800">{ru.signIn.title}</h1>

      <label className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">{ru.signIn.email}</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-1.5"
        />
      </label>
      <label className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">{ru.signIn.password}</span>
        <input
          name="password"
          type="password"
          required
          className="rounded-md border border-zinc-300 px-3 py-1.5"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full max-w-sm rounded-md bg-zinc-900 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
      >
        {isPending ? ru.signIn.submitPending : ru.signIn.submit}
      </button>

      <Link href="/auth/sign-up" className="text-sm text-zinc-500 underline">
        {ru.signIn.noAccount}
      </Link>
    </form>
  );
}
