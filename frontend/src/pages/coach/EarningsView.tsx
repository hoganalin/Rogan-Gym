import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMonthlyRevenue } from "../../api/coach";

const MONTHS = [
  { value: "january", label: "1月" },
  { value: "february", label: "2月" },
  { value: "march", label: "3月" },
  { value: "april", label: "4月" },
  { value: "may", label: "5月" },
  { value: "june", label: "6月" },
  { value: "july", label: "7月" },
  { value: "august", label: "8月" },
  { value: "september", label: "9月" },
  { value: "october", label: "10月" },
  { value: "november", label: "11月" },
  { value: "december", label: "12月" },
];

interface MonthRevenue {
  month: string;
  label: string;
  revenue: number;
  participants: number;
  course_count: number;
}

export default function EarningsView() {
  const [data, setData] = useState<MonthRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(MONTHS[0].value);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(
      MONTHS.map((m) =>
        getMonthlyRevenue(m.value).then((res) => ({
          month: m.value,
          label: m.label,
          revenue: res.data.total.revenue,
          participants: res.data.total.participants,
          course_count: res.data.total.course_count,
        })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        setData(results);
      })
      .catch(() => {
        if (cancelled) return;
        setError("載入營收資料失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-muted">載入中…</p>;
  if (error) return <p className="text-rose-700">{error}</p>;

  const current = data.find((d) => d.month === selected);

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-tight">營收報表</h1>
      <p className="mt-3 text-sm font-light text-muted">查看今年各月份的營收統計。</p>

      <div className="mt-8 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
            <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--color-line)" }} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 4 }}
              labelStyle={{ color: "var(--color-body)" }}
              itemStyle={{ color: "var(--color-brand-500)" }}
              cursor={{ fill: "rgba(244,80,30,.08)" }}
            />
            <Bar dataKey="revenue" fill="var(--color-brand-500)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-8 block max-w-xs">
        <span className="font-mono text-[11px] tracking-wider text-muted">選擇月份查看明細</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-2.5 w-full rounded-[4px] border border-line bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {current && (
        <div className="mt-6 flex flex-wrap gap-6">
          <div className="rounded-md border border-line bg-surface px-5 py-4">
            <div className="font-mono text-[11px] tracking-wider text-muted">營收</div>
            <div className="mt-1.5 font-display text-2xl font-bold text-brand-500">
              NT$&thinsp;{current.revenue.toLocaleString()}
            </div>
          </div>
          <div className="rounded-md border border-line bg-surface px-5 py-4">
            <div className="font-mono text-[11px] tracking-wider text-muted">參與人次</div>
            <div className="mt-1.5 font-display text-2xl font-bold">{current.participants}</div>
          </div>
          <div className="rounded-md border border-line bg-surface px-5 py-4">
            <div className="font-mono text-[11px] tracking-wider text-muted">報名數</div>
            <div className="mt-1.5 font-display text-2xl font-bold">{current.course_count}</div>
          </div>
        </div>
      )}
    </div>
  );
}
