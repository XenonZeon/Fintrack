import QRCode from "qrcode";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  countTelegramTransactions,
  getRecentTelegramTransactions,
  getTelegramAccount,
  issueLinkToken,
} from "@/lib/db/queries/telegram";
import { dayLabel, fullDateLabel } from "@/lib/format/date-ru";
import { formatSignedRub } from "@/lib/format/money";
import { pluralRu } from "@/lib/format/plural-ru";
import { ru } from "@/lib/i18n/ru";
import { DisconnectButton } from "./DisconnectButton";
import { TelegramLinkCard } from "./TelegramLinkCard";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function HowToUseCard() {
  return (
    <div
      className="rounded-lg border p-7"
      style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
    >
      <div className="mb-5 text-[11px] uppercase tracking-wide" style={{ color: "var(--app-text-dimmer)" }}>
        {ru.telegram.howToUseTitle}
      </div>
      <div className="mb-4.5 text-sm leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
        {ru.telegram.howToUseBody}
      </div>
      <div className="flex flex-col gap-2.5">
        <div
          className="max-w-[70%] self-end rounded-tl-xl rounded-tr-xl rounded-bl-xl px-3.5 py-2.5 text-sm font-semibold"
          style={{ background: "var(--app-text)", color: "var(--app-bg)" }}
        >
          {ru.telegram.exampleUser}
        </div>
        <div
          className="max-w-[70%] self-start rounded-tl-xl rounded-tr-xl rounded-br-xl px-3.5 py-2.5 text-sm"
          style={{ background: "var(--app-border-faint)", color: "var(--app-text-dim)" }}
        >
          {ru.telegram.exampleBot}
        </div>
      </div>
    </div>
  );
}

export async function TelegramView() {
  const user = await requireCurrentUser();
  const userId = user.id;

  const account = await getTelegramAccount(userId);

  if (account) {
    const [txCount, recent] = await Promise.all([
      countTelegramTransactions(userId),
      getRecentTelegramTransactions(userId, 3),
    ]);

    return (
      <div>
        <div className="mb-16">
          <Breadcrumb section={ru.telegram.breadcrumb} current={ru.telegram.breadcrumbCurrent} />
        </div>
        <div className="mb-3 flex items-center gap-3.5">
          <div className="text-[32px] font-extrabold tracking-tight">{ru.telegram.connectedTitle}</div>
          <div
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.25"
            style={{ background: "rgba(120,200,150,0.12)", borderColor: "rgba(120,200,150,0.3)" }}
          >
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.75 0.15 150)" }} />
            <div className="text-xs font-semibold" style={{ color: "oklch(0.8 0.1 150)" }}>
              {ru.telegram.connected}
            </div>
          </div>
        </div>
        <div
          className="mb-12 max-w-[520px] text-sm leading-relaxed"
          style={{ color: "var(--app-text-dimmer)" }}
        >
          {ru.telegram.connectedSubtitle}
        </div>

        <div className="grid grid-cols-[320px_1fr] items-start gap-7">
          <div
            className="flex h-75 flex-col gap-5 rounded-lg border p-7"
            style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full border"
                style={{ background: "var(--app-bg)", borderColor: "var(--app-border-strong)" }}
              >
                <div className="text-lg font-extrabold">{initials(user.name || user.email)}</div>
              </div>
              <div>
                <div className="text-[15px] font-bold">{user.name || user.email}</div>
                {account.telegramUsername && (
                  <div className="text-[13px]" style={{ color: "var(--app-text-dimmer)" }}>
                    @{account.telegramUsername}
                  </div>
                )}
              </div>
            </div>
            <div className="h-px" style={{ background: "var(--app-border-strong)" }} />
            <div className="flex flex-col gap-3.5">
              <div>
                <div
                  className="mb-1 text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--app-text-dimmer)" }}
                >
                  {ru.telegram.connectedSince}
                </div>
                <div className="text-sm" style={{ color: "var(--app-text-dim)" }}>
                  {fullDateLabel(account.linkedAt)}
                </div>
              </div>
              <div>
                <div
                  className="mb-1 text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--app-text-dimmer)" }}
                >
                  {ru.telegram.addedByBot}
                </div>
                <div className="text-sm" style={{ color: "var(--app-text-dim)" }}>
                  {txCount} {pluralRu(txCount, ru.telegram.txCount)}
                </div>
              </div>
            </div>
            <DisconnectButton />
          </div>

          <div className="flex flex-col gap-4">
            <HowToUseCard />

            <div
              className="rounded-lg border p-7"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div
                className="mb-5 text-[11px] uppercase tracking-wide"
                style={{ color: "var(--app-text-dimmer)" }}
              >
                {ru.telegram.recentFromBotTitle}
              </div>
              <div className="flex flex-col">
                {recent.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center py-3"
                    style={{ borderBottom: "1px solid var(--app-border-faint)" }}
                  >
                    <div className="w-22.5 text-[13px]" style={{ color: "var(--app-text-dim)" }}>
                      {dayLabel(tx.occurredAt)}
                    </div>
                    <div className="w-35 text-sm font-semibold">
                      {tx.categoryName ?? ru.transactions.noCategory}
                    </div>
                    <div className="flex-1 text-sm" style={{ color: "var(--app-text-dimmer)" }}>
                      {tx.comment}
                    </div>
                    <div className="text-sm font-bold">{formatSignedRub(tx.amountMinor, tx.type)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { token, expiresAt } = await issueLinkToken(userId);
  const botUsername = process.env.TELEGRAM_BOT_USERNAME!;
  const deepLink = `https://t.me/${botUsername}?start=${token}`;
  const qrDataUrl = await QRCode.toDataURL(deepLink, { margin: 1, width: 320 });

  return (
    <div>
      <div className="mb-16">
        <Breadcrumb section={ru.telegram.breadcrumb} current={ru.telegram.breadcrumbCurrent} />
      </div>
      <div className="mb-3 text-[32px] font-extrabold tracking-tight">{ru.telegram.notConnectedTitle}</div>
      <div className="mb-12 max-w-[520px] text-sm leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
        {ru.telegram.notConnectedSubtitle}
      </div>

      <div className="grid grid-cols-[320px_1fr] items-start gap-7">
        <TelegramLinkCard
          initialToken={token}
          initialExpiresAt={expiresAt.toISOString()}
          initialQrDataUrl={qrDataUrl}
        />

        <div className="flex flex-col gap-4">
          <div
            className="rounded-lg border p-7"
            style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
          >
            <div
              className="mb-5 text-[11px] uppercase tracking-wide"
              style={{ color: "var(--app-text-dimmer)" }}
            >
              {ru.telegram.howToConnectTitle}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border text-xs font-bold"
                  style={{ borderColor: "var(--app-border-strong)" }}
                >
                  1
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--app-text-dim)" }}>
                  {ru.telegram.step1Pre} <span className="font-semibold text-[#FAF9F6]">@{botUsername}</span>{" "}
                  {ru.telegram.step1Post}
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border text-xs font-bold"
                  style={{ borderColor: "var(--app-border-strong)" }}
                >
                  2
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--app-text-dim)" }}>
                  {ru.telegram.step2Pre} <span className="font-semibold text-[#FAF9F6]">/start</span>{" "}
                  {ru.telegram.step2Mid}
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div
                  className="flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border text-xs font-bold"
                  style={{ borderColor: "var(--app-border-strong)" }}
                >
                  3
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--app-text-dim)" }}>
                  {ru.telegram.step3}
                </div>
              </div>
            </div>
          </div>

          <HowToUseCard />
        </div>
      </div>
    </div>
  );
}
