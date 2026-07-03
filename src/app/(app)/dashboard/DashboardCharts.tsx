"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatRub } from "@/lib/format/money";
import { ru } from "@/lib/i18n/ru";

export type CategorySlice = { name: string; totalMinor: number; color: string };
export type DailyPoint = { day: number; totalMinor: number };

const tooltipStyle = {
  background: "var(--app-bg-modal)",
  border: "1px solid var(--app-border)",
  borderRadius: 8,
  fontSize: 13,
};

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const total = data.reduce((sum, d) => sum + d.totalMinor, 0);

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="h-[168px] w-[168px]">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalMinor"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={84}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatRub(Number(value)) + " ₽", ""]}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "var(--app-text)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full rounded-full" style={{ border: "14px solid var(--app-border-strong)" }} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.length === 0 && (
          <div className="py-2 text-center text-sm" style={{ color: "var(--app-text-dimmer)" }}>
            {ru.dashboard.noExpenses}
          </div>
        )}
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-2.5 text-[13px]">
            <div className="h-2 w-2 flex-none rounded-full" style={{ background: slice.color }} />
            <div className="flex-1" style={{ color: "var(--app-text-dim)" }}>
              {slice.name}
            </div>
            <div className="font-semibold" style={{ color: "var(--app-text)" }}>
              {formatRub(slice.totalMinor)} ₽
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyExpensesChart({ data }: { data: DailyPoint[] }) {
  const chartData = data.map((d) => ({ day: d.day, amountMinor: d.totalMinor }));
  const tickInterval = data.length > 20 ? 1 : 0;

  return (
    <div style={{ width: "100%", aspectRatio: "640 / 200" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="dailyExpenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.9 0 0)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="oklch(0.9 0 0)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.07)" strokeDasharray="2 4" />
          <XAxis
            dataKey="day"
            tick={{ fill: "oklch(0.42 0 0)", fontSize: 9 }}
            axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
            tickLine={false}
            interval={tickInterval}
          />
          <Tooltip
            formatter={(value) => [formatRub(Number(value)) + " ₽", ""]}
            labelFormatter={(day) => `${day} день`}
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--app-text)" }}
          />
          <Area
            type="monotone"
            dataKey="amountMinor"
            stroke="oklch(0.8 0 0)"
            strokeWidth={2}
            fill="url(#dailyExpenseGradient)"
            dot={{ r: 2.5, fill: "oklch(0.95 0 0)", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
