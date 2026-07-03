"use client";

import { useEffect, useRef, useState } from "react";
import { ru } from "@/lib/i18n/ru";
import { issueTelegramLinkTokenAction } from "./actions";

const REFRESH_MARGIN_MS = 10_000;

export function TelegramLinkCard({
  initialToken,
  initialExpiresAt,
  initialQrDataUrl,
}: {
  initialToken: string;
  initialExpiresAt: string;
  initialQrDataUrl: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [qrDataUrl, setQrDataUrl] = useState(initialQrDataUrl);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function refresh() {
      const result = await issueTelegramLinkTokenAction();
      setToken(result.token);
      setExpiresAt(result.expiresAt);
      setQrDataUrl(result.qrDataUrl);
    }

    function schedule(expiresAtIso: string) {
      const delay = Math.max(0, new Date(expiresAtIso).getTime() - Date.now() - REFRESH_MARGIN_MS);
      timeoutRef.current = setTimeout(async () => {
        await refresh();
      }, delay);
    }

    schedule(expiresAt);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [expiresAt]);

  return (
    <div
      className="flex h-112.5 flex-col items-center gap-5 rounded-lg border p-7"
      style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
    >
      <div
        className="flex aspect-square w-full items-center justify-center rounded-lg"
        style={{ background: "var(--app-bg)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="" className="h-full w-full rounded-lg" />
      </div>
      <div className="w-full text-center">
        <div
          className="mb-2 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--app-text-dimmer)" }}
        >
          {ru.telegram.manualCode}
        </div>
        <div
          className="rounded-md border py-3 font-mono text-[22px] font-bold tracking-wider"
          style={{ background: "var(--app-bg)", borderColor: "var(--app-border-strong)" }}
        >
          {token}
        </div>
      </div>
    </div>
  );
}
