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

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;

  const current = data.find((d) => d.month === selected);

  return (
    <div>
      <h1 className="text-2xl font-bold">營收報表</h1>
      <p className="mt-2 text-slate-600">查看今年各月份的營收統計。</p>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#ea580c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-6 block max-w-xs text-sm">
        選擇月份查看明細
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {current && (
        <div className="mt-4 flex gap-6 text-sm text-slate-600">
          <p>
            營收：<span className="font-semibold text-brand-600">${current.revenue}</span>
          </p>
          <p>參與人次：{current.participants}</p>
          <p>報名數：{current.course_count}</p>
        </div>
      )}
    </div>
  );
}
