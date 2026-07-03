import { signOut } from "./actions";
import { ru } from "@/lib/i18n/ru";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-zinc-800">{ru.common.appName}</h1>
      <p className="text-zinc-500">{ru.dashboard.empty}</p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
        >
          {ru.dashboard.signOut}
        </button>
      </form>
    </div>
  );
}
