import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { getCoachCourseList, getMonthlyRevenue } from "../api/coach";
import { getSkills } from "../api/skill";

const NAV = [
  { label: "教練檔案", to: "/coach/profile" },
  { label: "課程管理", to: "/coach/courses" },
  { label: "營收報表", to: "/coach/earnings" },
  { label: "技能標籤", to: "/coach/skills" },
];

export interface CoachLayoutContext {
  refreshSummary: () => void;
}

export function CoachLayout() {
  const location = useLocation();
  const [courseCount, setCourseCount] = useState<number | null>(null);
  const [skillCount, setSkillCount] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<{ revenue: number; course_count: number; participants: number } | null>(
    null,
  );

  const refreshSummary = useCallback(() => {
    const month = dayjs().format("MMMM").toLowerCase();

    Promise.all([getCoachCourseList(), getSkills(), getMonthlyRevenue(month)])
      .then(([coursesRes, skillsRes, revenueRes]) => {
        setCourseCount(coursesRes.data.length);
        setSkillCount(skillsRes.data.length);
        setRevenue(revenueRes.data.total);
      })
      .catch((err) => {
        console.error("Failed to load coach layout summary", err);
      });
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  return (
    <div className="mx-auto flex max-w-6xl">
      <aside className="w-[246px] shrink-0 border-r border-[#1d1f24] bg-[#0a0b0c] py-6">
        <div className="flex items-center gap-2.5 px-[22px] pb-[26px]">
          <img src="/assets/logo-mark.png" alt="" className="h-7 w-7 shrink-0 rounded-[5px] object-cover" />
          <span className="font-display text-lg font-black tracking-tight">
            R<span className="mx-px" />FITNESS
          </span>
          <span className="rounded-[2px] border border-[#4a3b33] px-[5px] py-1 font-mono text-[9px] text-brand-500">
            COACH
          </span>
        </div>
        <div className="px-[22px] pb-3.5 font-mono text-[11px] tracking-widest text-[#57524c]">工作區</div>
        <div className="flex flex-col">
          {NAV.map((item) => {
            const on = location.pathname === item.to || (item.to === "/coach/profile" && location.pathname === "/coach");
            const badge = item.to === "/coach/courses" ? courseCount : item.to === "/coach/skills" ? skillCount : null;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between border-l-2 px-[22px] py-3 text-sm font-medium ${
                  on ? "border-brand-500 bg-brand-500/10 text-[#ffb494]" : "border-transparent text-muted hover:text-body"
                }`}
              >
                {item.label}
                {badge !== null && <span className="font-mono text-[11px] text-[#57524c]">{badge}</span>}
              </Link>
            );
          })}
        </div>
        <div className="mx-[22px] mt-6 border-t border-[#1d1f24] pt-[22px]">
          <div className="font-mono text-[11px] tracking-wider text-[#8a857f]">本月營收</div>
          <div className="mt-3 font-display text-3xl font-black tracking-tight text-brand-500">
            NT$&thinsp;{revenue ? revenue.revenue.toLocaleString() : "–"}
          </div>
          <div className="mt-2 text-xs font-light text-faint">
            {revenue ? `${revenue.course_count} 堂課 · ${revenue.participants} 人次` : "載入中…"}
          </div>
        </div>
      </aside>
      <section className="flex-1 p-10">
        <Outlet context={{ refreshSummary } satisfies CoachLayoutContext} />
      </section>
    </div>
  );
}
