import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ru } from "@/lib/i18n/ru";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-zinc-800">{ru.common.appName}</h1>
      <Link
        href={user ? "/dashboard" : "/auth/sign-in"}
        className="rounded-md bg-zinc-900 px-4 py-2 text-white"
      >
        {user ? ru.home.dashboardCta : ru.home.signInCta}
      </Link>
    </div>
  );
}
