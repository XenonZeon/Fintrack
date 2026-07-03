import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold text-zinc-800">{ru.verifyEmail.title}</h1>
      <p className="max-w-sm text-zinc-500">{ru.verifyEmail.body}</p>
      <Link href="/auth/sign-in" className="text-sm text-zinc-500 underline">
        {ru.verifyEmail.backToSignIn}
      </Link>
    </div>
  );
}
