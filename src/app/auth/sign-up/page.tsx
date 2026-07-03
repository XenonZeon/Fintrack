"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithEmail } from "./actions";

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

  return (
    <form
      action={formAction}
      className="flex flex-1 flex-col items-center justify-center gap-5"
    >
      <h1 className="text-2xl font-semibold text-zinc-800">Регистрация</h1>

      <label className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Имя</span>
        <input
          name="name"
          type="text"
          required
          className="rounded-md border border-zinc-300 px-3 py-1.5"
        />
      </label>
      <label className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Email</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-zinc-300 px-3 py-1.5"
        />
      </label>
      <label className="flex w-full max-w-sm flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-700">Пароль</span>
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
        {isPending ? "Создаём..." : "Создать аккаунт"}
      </button>

      <Link href="/auth/sign-in" className="text-sm text-zinc-500 underline">
        Уже есть аккаунт? Войти
      </Link>
    </form>
  );
}
