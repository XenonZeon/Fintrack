import { signOut } from "./actions";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-zinc-800">Fintrack</h1>
      <p className="text-zinc-500">Дашборд пока пуст</p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
