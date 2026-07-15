import Link from "next/link";
import { Inter } from "next/font/google";
import { getCurrentUser } from "@/lib/auth/current-user";
import { ru } from "@/lib/i18n/ru";
import { formatRub } from "@/lib/format/money";

const inter = Inter({ subsets: ["latin"], variable: "--font-welcome" });

export const dynamic = "force-dynamic";

const previewCategories = [
  { key: "housing", amountMinor: 3_500_000 },
  { key: "food", amountMinor: 662_000 },
  { key: "clothes", amountMinor: 560_000 },
  { key: "entertainment", amountMinor: 500_000 },
  { key: "health", amountMinor: 500_000 },
  { key: "other", amountMinor: 573_900 },
] as const;

const dashboardCardBars = [34, 22, 18, 13, 8, 5];

const step3Bars = [60, 100, 40];

// Больше сумма/значение — светлее оттенок серого, меньше — темнее.
function grayShades(count: number, lightest: number, darkest: number) {
  if (count <= 1) return [`oklch(${lightest} 0 0)`];
  const step = (lightest - darkest) / (count - 1);
  return Array.from({ length: count }, (_, i) => `oklch(${(lightest - step * i).toFixed(3)} 0 0)`);
}

function shadesByRank(values: readonly number[], lightest: number, darkest: number) {
  const shades = grayShades(values.length, lightest, darkest);
  const order = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value);
  const colorByIndex: string[] = [];
  order.forEach(({ index }, rank) => {
    colorByIndex[index] = shades[rank];
  });
  return colorByIndex;
}

const previewCategoryColors = shadesByRank(
  previewCategories.map((c) => c.amountMinor),
  0.82,
  0.38
);
const dashboardBarColors = shadesByRank(dashboardCardBars, 0.82, 0.38);
const step3BarColors = shadesByRank(step3Bars, 0.75, 0.45);

export default async function Home() {
  const user = await getCurrentUser();
  const ctaHref = user ? "/dashboard" : "/auth/sign-in";

  return (
    <div
      className={`${inter.variable} w-full min-h-screen`}
      style={{ background: "var(--app-bg)", color: "var(--app-text)", fontFamily: "var(--font-welcome), sans-serif" }}
    >
      <div className="flex items-center justify-between px-8 py-8 md:px-14">
        <div className="flex items-center gap-3">
          <div
            className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full border-2"
            style={{ borderColor: "var(--app-text)" }}
          >
            <span className="text-xs font-black tracking-tighter">FT</span>
          </div>
          <span className="text-base font-extrabold tracking-tight">{ru.welcome.brand}</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-6 pb-20">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 text-[13px] uppercase tracking-[0.14em]"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.welcome.eyebrow}
          </div>
          <h1 className="max-w-[820px] text-[44px] leading-[1.1] font-extrabold tracking-tight md:text-[68px] md:leading-[1.08]">
            {ru.welcome.title}
          </h1>
          <p
            className="mt-6 max-w-[600px] text-lg leading-relaxed md:text-[19px]"
            style={{ color: "var(--app-text-dim)" }}
          >
            {ru.welcome.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {ru.welcome.pills.map((pill) => (
              <div
                key={pill}
                className="rounded-full border px-4 py-2 text-xs"
                style={{ color: "var(--app-text-dim)", borderColor: "var(--app-border-stronger)" }}
              >
                {pill}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-2.5">
            <Link
              href={ctaHref}
              className="rounded-lg px-8 py-4 text-[15px] font-bold"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              {ru.welcome.ctaDemo}
            </Link>
            <div className="text-[13px]" style={{ color: "var(--app-text-dimmest)" }}>
              {ru.welcome.demoNote}{" "}
              <Link href="/auth/sign-in" className="underline">
                {ru.welcome.demoNoteLogin}
              </Link>
            </div>
          </div>
        </div>

        {/* Live preview widget */}
        <div className="relative mt-24 w-full max-w-[920px]">
          <div
            className="rounded-2xl border px-6 py-7 text-left shadow-2xl md:px-9"
            style={{ background: "var(--app-bg-modal)", borderColor: "var(--app-border-strong)" }}
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div
                className="text-[11px] uppercase tracking-[0.1em]"
                style={{ color: "var(--app-text-dimmer)" }}
              >
                {ru.welcome.previewLabel}
              </div>
              <div className="flex gap-5">
                <div className="text-[11px]" style={{ color: "var(--app-text-dimmer)" }}>
                  {ru.welcome.previewIncome}{" "}
                  <span className="font-semibold" style={{ color: "var(--app-text)" }}>
                    113 000 ₽
                  </span>
                </div>
                <div className="text-[11px]" style={{ color: "var(--app-text-dimmer)" }}>
                  {ru.welcome.previewExpense}{" "}
                  <span className="font-semibold" style={{ color: "var(--app-text)" }}>
                    62 959 ₽
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 text-[40px] font-extrabold tracking-tight">+ 50 041 ₽</div>

            <div
              className="mb-4 grid grid-cols-2 gap-x-3 gap-y-4 border-b pb-4 md:grid-cols-3"
              style={{ borderColor: "var(--app-border-faint)" }}
            >
              {previewCategories.map((category, i) => (
                <div key={category.key} className="flex min-w-0 items-center gap-1.5 text-xs">
                  <div
                    className="h-[7px] w-[7px] flex-none rounded-[2px]"
                    style={{ background: previewCategoryColors[i] }}
                  />
                  <div
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ color: "var(--app-text-dim)" }}
                  >
                    {ru.welcome.categories[category.key]}
                  </div>
                  <div className="flex-none font-semibold whitespace-nowrap" style={{ color: "var(--app-text)" }}>
                    {formatRub(category.amountMinor)} ₽
                  </div>
                </div>
              ))}
            </div>

            <svg width="100%" height="140" viewBox="0 0 640 200" preserveAspectRatio="none" className="block overflow-visible">
              <defs>
                <linearGradient id="welcomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.9 0 0)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="oklch(0.9 0 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path
                d="M0,75 C6.3,74.5 25.5,72.7 38,72 C50.5,71.3 62.5,71.5 75,71 C87.5,70.5 100.3,70.3 113,69 C125.7,67.7 138.5,64.3 151,63 C163.5,61.7 175.5,62.2 188,61 C200.5,59.8 213.3,57.8 226,56 C238.7,54.2 251.5,53.5 264,50 C276.5,46.5 288.5,38.2 301,35 C313.5,31.8 326.5,32.3 339,31 C351.5,29.7 363.5,27.8 376,27 C388.5,26.2 401.3,27.2 414,26 C426.7,24.8 439.5,21.5 452,20 C464.5,18.5 476.5,18.8 489,17 C501.5,15.2 514.3,10.8 527,9 C539.7,7.2 552.5,7.2 565,6 C577.5,4.8 589.5,3 602,2 C614.5,1 633.7,0.3 640,0 L640,170 L0,170 Z"
                fill="url(#welcomeAreaGrad)"
                stroke="none"
              />
              <path
                d="M0,75 C6.3,74.5 25.5,72.7 38,72 C50.5,71.3 62.5,71.5 75,71 C87.5,70.5 100.3,70.3 113,69 C125.7,67.7 138.5,64.3 151,63 C163.5,61.7 175.5,62.2 188,61 C200.5,59.8 213.3,57.8 226,56 C238.7,54.2 251.5,53.5 264,50 C276.5,46.5 288.5,38.2 301,35 C313.5,31.8 326.5,32.3 339,31 C351.5,29.7 363.5,27.8 376,27 C388.5,26.2 401.3,27.2 414,26 C426.7,24.8 439.5,21.5 452,20 C464.5,18.5 476.5,18.8 489,17 C501.5,15.2 514.3,10.8 527,9 C539.7,7.2 552.5,7.2 565,6 C577.5,4.8 589.5,3 602,2 C614.5,1 633.7,0.3 640,0"
                fill="none"
                stroke="oklch(0.85 0 0)"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 w-full max-w-[1040px]">
          <div
            className="mb-8 text-center text-xs uppercase tracking-[0.14em]"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.welcome.howItWorks}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-0">
            <div
              className="min-w-[220px] max-w-[280px] flex-1 rounded-xl border p-6 text-center"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div
                className="mb-3.5 inline-block max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[2px] rounded-bl-[10px] px-3 py-2 text-xs font-semibold"
                style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
              >
                {ru.welcome.step1Bubble}
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.step1Text}
              </div>
            </div>
            <div className="flex-none px-5 text-2xl" style={{ color: "var(--app-text-faint)" }}>
              →
            </div>
            <div
              className="min-w-[220px] max-w-[280px] flex-1 rounded-xl border p-6 text-center"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div
                className="mb-3.5 inline-block max-w-full rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[2px] px-3 py-2 text-xs"
                style={{ background: "var(--app-bg-input)", color: "var(--app-text-dim)" }}
              >
                {ru.welcome.step2Bubble}
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.step2Text}
              </div>
            </div>
            <div className="flex-none px-5 text-2xl" style={{ color: "var(--app-text-faint)" }}>
              →
            </div>
            <div
              className="min-w-[220px] max-w-[280px] flex-1 rounded-xl border p-6 text-center"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div className="mb-3.5 flex h-[38px] items-end justify-center gap-1.5">
                <div className="h-[60%] w-3.5 rounded-t-[3px] rounded-b-[1px]" style={{ background: step3BarColors[0] }} />
                <div className="h-full w-3.5 rounded-t-[3px] rounded-b-[1px]" style={{ background: step3BarColors[1] }} />
                <div className="h-[40%] w-3.5 rounded-t-[3px] rounded-b-[1px]" style={{ background: step3BarColors[2] }} />
              </div>
              <div className="text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.step3Text}
              </div>
            </div>
          </div>
        </div>

        {/* What's inside */}
        <div className="mt-24 w-full max-w-[1040px]">
          <div
            className="mb-8 text-center text-xs uppercase tracking-[0.14em]"
            style={{ color: "var(--app-text-dimmer)" }}
          >
            {ru.welcome.whatsInside}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              className="flex flex-col rounded-xl border p-7 text-left"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div className="mb-2 text-base font-bold">{ru.welcome.dashboardCardTitle}</div>
              <div className="mb-5 text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.dashboardCardText}
              </div>
              <div className="mt-auto flex h-[104px] items-end gap-2">
                {dashboardCardBars.map((percent, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <div className="text-[10px] font-bold" style={{ color: "var(--app-text)" }}>
                      {percent}%
                    </div>
                    <div
                      className="w-full max-w-[22px] rounded-t-[4px] rounded-b-[2px]"
                      style={{ height: `${percent * 3}%`, background: dashboardBarColors[i] }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex flex-col rounded-xl border p-7 text-left"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div className="mb-2 text-base font-bold">{ru.welcome.transactionsCardTitle}</div>
              <div className="mb-5 text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.transactionsCardText}
              </div>
              <div className="mt-auto flex flex-col gap-2.5">
                {ru.welcome.transactionsDemo.map((tx) => (
                  <div
                    key={tx.name}
                    className="flex items-center justify-between border-b pb-2 text-xs"
                    style={{ borderColor: "var(--app-border-faint)" }}
                  >
                    <div style={{ color: "var(--app-text-dim)" }}>{tx.name}</div>
                    <div className="font-semibold">{tx.amount}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex flex-col rounded-xl border p-7 text-left"
              style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
            >
              <div className="mb-2 text-base font-bold">{ru.welcome.telegramCardTitle}</div>
              <div className="mb-5 text-[13px] leading-relaxed" style={{ color: "var(--app-text-dimmer)" }}>
                {ru.welcome.telegramCardText}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <div
                  className="max-w-[80%] self-end rounded-tl-[10px] rounded-tr-[10px] rounded-br-[2px] rounded-bl-[10px] px-3 py-2 text-xs font-semibold"
                  style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
                >
                  {ru.welcome.telegramBubbleUser}
                </div>
                <div
                  className="max-w-[80%] self-start rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-[2px] px-3 py-2 text-xs"
                  style={{ background: "var(--app-bg-input)", color: "var(--app-text-dim)" }}
                >
                  {ru.welcome.telegramBubbleBot}
                </div>
                <div className="mt-1.5 text-[11px]" style={{ color: "var(--app-text-faint)" }}>
                  {ru.welcome.telegramNote}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div
          className="mt-24 w-full max-w-[640px] rounded-2xl border px-8 py-10 text-center"
          style={{ background: "var(--app-bg-elevated)", borderColor: "var(--app-border)" }}
        >
          <div className="mb-3 text-xl font-extrabold md:text-[22px]">{ru.welcome.closingTitle}</div>
          <div className="mb-6 text-sm" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.welcome.closingSubtitle}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/sign-in"
              className="rounded-lg px-6.5 py-3.5 text-sm font-bold"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              {ru.welcome.closingLogin}
            </Link>
            <Link
              href={ctaHref}
              className="rounded-lg border px-6.5 py-3.5 text-sm font-bold"
              style={{ color: "var(--app-text-dim)", borderColor: "var(--app-border-stronger)" }}
            >
              {ru.welcome.closingDemo}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
