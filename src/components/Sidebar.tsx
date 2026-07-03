"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ru } from "@/lib/i18n/ru";
import { signOut } from "@/app/(app)/actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: ru.sidebar.dashboard, enabled: true },
  { href: "/transactions", label: ru.sidebar.transactions, enabled: true },
  { href: null, label: ru.sidebar.budget, enabled: false, tag: ru.sidebar.budgetSoon },
  { href: null, label: ru.sidebar.telegramBot, enabled: false },
] as const;

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <div
      className="flex h-full w-[264px] flex-none flex-col p-9 px-7"
      style={{
        background: "var(--app-bg-sidebar)",
        borderRight: "1px solid var(--app-border)",
        color: "var(--app-text)",
      }}
    >
      <div className="mb-14 flex items-center gap-3">
        <div
          className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border-2"
          style={{ borderColor: "var(--app-text)" }}
        >
          <div className="text-xs font-black tracking-tighter" style={{ color: "var(--app-text)" }}>
            FT
          </div>
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight">{ru.common.appName}</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.sidebar.tagline}
          </div>
        </div>
      </div>

      <div
        className="mb-3.5 text-[11px] uppercase tracking-wider"
        style={{ color: "var(--app-text-dimmest)" }}
      >
        {ru.sidebar.menu}
      </div>
      <div className="mb-9 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-md px-3.5 py-2.75"
                style={{ color: "var(--app-text-dimmer)" }}
              >
                <div className="h-1.5 w-1.5 rounded-full" />
                <div className="text-sm">
                  {item.label}
                  {"tag" in item && item.tag && (
                    <span className="ml-1 text-[10px]" style={{ color: "var(--app-text-faint)" }}>
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3.5 py-2.75"
              style={active ? { background: "var(--app-border-faint)" } : undefined}
            >
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--app-text)", opacity: active ? 1 : 0 }}
              />
              <div className="text-sm font-semibold">{item.label}</div>
            </Link>
          );
        })}
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-3 pt-6"
        style={{ borderTop: "1px solid var(--app-border)" }}
      >
        <div>
          <div className="text-[13px] font-semibold">{userName}</div>
          <div className="mt-0.5 text-[11px]" style={{ color: "var(--app-text-dimmest)" }}>
            {ru.sidebar.personalAccount}
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex-none rounded-md px-2.5 py-1.5 text-xs font-semibold"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.sidebar.signOut}
          </button>
        </form>
      </div>
    </div>
  );
}
