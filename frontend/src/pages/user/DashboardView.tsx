import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs, { type Dayjs } from "dayjs";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { UserLayoutContext } from "../../layouts/UserLayout";
import type { UserCourseBooking } from "../../types/api";

type ViewMode = "week" | "month" | "list";

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: "week", label: "週曆" },
  { key: "month", label: "月曆" },
  { key: "list", label: "清單" },
];

function mondayOf(d: Dayjs): Dayjs {
  const day = d.day();
  const diff = day === 0 ? -6 : 1 - day;
  return d.add(diff, "day").startOf("day");
}

export default function DashboardView() {
  const { dashboard, loading, refresh } = useOutletContext<UserLayoutContext>();
  const { cancelBooking } = useCourseActions();
  const [view, setView] = useState<ViewMode>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  const bookings = dashboard?.course_booking ?? [];

  async function handleCancel(courseId: string, courseName: string) {
    const cancelled = await cancelBooking(courseId, courseName);
    if (cancelled) refresh();
  }

  const thisWeekStart = useMemo(() => mondayOf(dayjs()), []);
  const thisWeekActiveCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          !b.cancelled_at &&
          dayjs(b.start_at).valueOf() >= thisWeekStart.valueOf() &&
          dayjs(b.start_at).valueOf() < thisWeekStart.add(7, "day").valueOf(),
      ).length,
    [bookings, thisWeekStart],
  );

  const weekStart = useMemo(() => mondayOf(dayjs()).add(weekOffset, "week"), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day")), [weekStart]);
  const weekBookings = useMemo(() => {
    const end = weekStart.add(7, "day").valueOf();
    return bookings.filter((b) => {
      const t = dayjs(b.start_at).valueOf();
      return t >= weekStart.valueOf() && t < end;
    });
  }, [bookings, weekStart]);
  const weekHours = useMemo(
    () => Array.from(new Set(weekBookings.map((b) => dayjs(b.start_at).format("HH:00")))).sort(),
    [weekBookings],
  );

  const monthStart = useMemo(() => dayjs().date(1).add(monthOffset, "month").startOf("day"), [monthOffset]);
  const monthGridStart = useMemo(() => mondayOf(monthStart), [monthStart]);
  const monthGridEnd = useMemo(() => {
    const end = monthStart.endOf("month");
    const day = end.day();
    const diff = day === 0 ? 0 : 7 - day;
    return end.add(diff, "day").startOf("day");
  }, [monthStart]);
  const monthCells = useMemo(() => {
    const totalDays = monthGridEnd.diff(monthGridStart, "day") + 1;
    return Array.from({ length: totalDays }, (_, i) => {
      const date = monthGridStart.add(i, "day");
      return {
        date,
        inMonth: date.isSame(monthStart, "month"),
        bookings: bookings.filter((b) => dayjs(b.start_at).isSame(date, "day")),
      };
    });
  }, [monthGridStart, monthGridEnd, monthStart, bookings]);

  const listBookings = useMemo(
    () => [...bookings].sort((a, b) => dayjs(a.start_at).valueOf() - dayjs(b.start_at).valueOf()),
    [bookings],
  );

  if (loading) return <p className="text-muted">載入中…</p>;
  if (!dashboard) return <p className="text-rose-400">載入課表失敗，請稍後再試。</p>;

  function bookingCell(b: UserCourseBooking) {
    const cancelled = !!b.cancelled_at;
    return (
      <div
        className={`h-full rounded-[3px] px-2.5 py-2 ${cancelled ? "bg-[#16181b]" : "bg-brand-500/15"}`}
        style={{ borderLeft: `3px solid ${cancelled ? "#2a2d33" : "#f4501e"}` }}
      >
        <div className={`text-xs leading-tight font-bold ${cancelled ? "text-faint" : "text-[#ffb494]"}`}>{b.name}</div>
        <div className={`mt-1 font-mono text-[10px] ${cancelled ? "text-[#4f4a45]" : "text-muted"}`}>
          {b.coach_name}
          {cancelled && "（已取消）"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[38px] font-extrabold tracking-tight">我的課表</h1>
          <p className="mt-3 text-sm font-light text-muted">
            剩餘 {dashboard.credit_remain} 堂 · 已使用 {dashboard.credit_usage} 堂 · 本週 {thisWeekActiveCount} 堂已報名
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5 rounded-[4px] border border-[#2a2d33] p-[3px]">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setView(tab.key)}
              className={`rounded-[3px] px-4.5 py-2.5 text-[13px] font-medium ${
                view === tab.key ? "bg-brand-500 text-ink" : "text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view !== "list" && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => (view === "week" ? setWeekOffset((o) => o - 1) : setMonthOffset((o) => o - 1))}
              className="h-[34px] w-[34px] rounded-[4px] border border-[#2a2d33] text-[#cfc9c2] hover:border-brand-400"
            >
              ←
            </button>
            <span className="font-display text-base font-bold">
              {view === "week"
                ? `${weekStart.format("M/D")} – ${weekStart.add(6, "day").format("M/D")}`
                : monthStart.format("YYYY 年 M 月")}
            </span>
            <button
              type="button"
              onClick={() => (view === "week" ? setWeekOffset((o) => o + 1) : setMonthOffset((o) => o + 1))}
              className="h-[34px] w-[34px] rounded-[4px] border border-[#2a2d33] text-[#cfc9c2] hover:border-brand-400"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-4.5 text-xs text-[#8a857f]">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-brand-500" />
              已報名
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#2a2d33]" />
              已取消
            </span>
          </div>
        </div>
      )}

      {view === "week" && (
        <div className="mt-5 overflow-x-auto rounded-md border border-line bg-[#0f1012]">
          <div className="grid min-w-[720px] grid-cols-[64px_repeat(7,1fr)]">
            <div className="border-r border-b border-[#1d1f24]" />
            {weekDays.map((d) => (
              <div key={d.toString()} className="border-r border-b border-[#1d1f24] py-4 text-center">
                <div className="font-mono text-[11px] text-faint">{DOW[d.day() === 0 ? 6 : d.day() - 1]}</div>
                <div
                  className={`mt-2 font-display text-xl font-bold ${d.isSame(dayjs(), "day") ? "text-brand-500" : "text-body"}`}
                >
                  {d.date()}
                </div>
              </div>
            ))}

            {weekHours.map((hour) => (
              <div key={hour} className="contents">
                <div className="border-r border-b border-[#16181b] py-2.5 text-center font-mono text-[11px] text-[#57524c]">
                  {hour}
                </div>
                {weekDays.map((d) => {
                  const match = weekBookings.find(
                    (b) => dayjs(b.start_at).format("HH:00") === hour && dayjs(b.start_at).isSame(d, "day"),
                  );
                  return (
                    <div key={d.toString()} className="min-h-[76px] border-r border-b border-[#16181b] p-1.5">
                      {match && bookingCell(match)}
                    </div>
                  );
                })}
              </div>
            ))}

            {weekHours.length === 0 && (
              <div className="col-span-8 px-6 py-10 text-center text-muted">本週沒有課程。</div>
            )}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="mt-5 overflow-x-auto rounded-md border border-line bg-[#0f1012]">
          <div className="grid min-w-[720px] grid-cols-7">
            {DOW.map((d) => (
              <div key={d} className="border-r border-b border-[#1d1f24] py-3.5 text-center font-mono text-[11px] text-faint">
                {d}
              </div>
            ))}
            {monthCells.map((cell) => (
              <div
                key={cell.date.toString()}
                className="box-border min-h-[104px] border-r border-b border-[#16181b] p-2.5"
              >
                <div
                  className={`font-mono text-xs ${
                    !cell.inMonth ? "text-[#2a2d33]" : cell.date.isSame(dayjs(), "day") ? "text-brand-500" : "text-[#8a857f]"
                  }`}
                >
                  {cell.date.date()}
                </div>
                {cell.bookings.slice(0, 2).map((b) => {
                  const cancelled = !!b.cancelled_at;
                  return (
                    <div
                      key={b.course_id}
                      className={`mt-2 rounded-[3px] px-2 py-1.5 ${cancelled ? "bg-[#16181b]" : "bg-brand-500/15"}`}
                      style={{ borderLeft: `3px solid ${cancelled ? "#2a2d33" : "#f4501e"}` }}
                    >
                      <div className={`text-[11px] leading-tight font-bold ${cancelled ? "text-faint" : "text-[#ffb494]"}`}>
                        {b.name}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-[#8a857f]">{dayjs(b.start_at).format("HH:mm")}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="mt-5 flex flex-col gap-3">
          {listBookings.map((b) => {
            const cancelled = !!b.cancelled_at;
            return (
              <div
                key={b.course_id}
                className="flex items-center gap-6 rounded-md border border-line bg-surface px-6 py-5"
              >
                <div className="w-[82px] shrink-0 border-r border-line pr-5 text-center">
                  <div className="font-mono text-[11px] text-faint">{dayjs(b.start_at).format("MMM").toUpperCase()}</div>
                  <div className={`mt-1.5 font-display text-3xl font-black ${cancelled ? "text-[#4f4a45]" : "text-brand-500"}`}>
                    {dayjs(b.start_at).date()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-[17px] font-bold ${cancelled ? "text-faint" : "text-body"}`}>{b.name}</span>
                    {cancelled && (
                      <span className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-[#8a857f]">
                        已取消
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-5 font-mono text-xs text-[#8a857f]">
                    <span>{formatCourseTime(b.start_at, b.end_at)}</span>
                    <span>{b.coach_name}</span>
                  </div>
                </div>
                {!cancelled && (
                  <div className="flex shrink-0 gap-2.5">
                    {b.meeting_url && (
                      <a
                        href={b.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[4px] border border-[#2a2d33] px-4.5 py-2.5 text-[13px] font-medium hover:border-brand-400"
                      >
                        會議連結
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancel(b.course_id, b.name)}
                      className="rounded-[4px] border border-[#4a2626] px-4.5 py-2.5 text-[13px] font-medium text-[#e8735c] hover:bg-[#4a2626]/20"
                    >
                      取消報名
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {listBookings.length === 0 && <p className="text-muted">目前沒有報名的課程。</p>}
        </div>
      )}
    </div>
  );
}
