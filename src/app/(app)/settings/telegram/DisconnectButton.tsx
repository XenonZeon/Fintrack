"use client";

import { useState, useTransition } from "react";
import { ru } from "@/lib/i18n/ru";
import { unlinkTelegramAction } from "./actions";

export function DisconnectButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await unlinkTelegramAction();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mt-1.5 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md border py-3 text-center text-[13px] font-semibold"
        style={{ borderColor: "var(--app-border-strong)", color: "var(--app-text-dimmer)" }}
      >
        {ru.telegram.disconnect}
      </button>
      {error && (
        <div className="text-xs" style={{ color: "oklch(0.7 0.15 25)" }}>
          {error}
        </div>
      )}
    </div>
  );
}
