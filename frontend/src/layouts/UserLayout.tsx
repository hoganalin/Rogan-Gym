import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { getUserCourses } from "../api/users";
import type { UserCoursesResult } from "../types/api";

export interface UserLayoutContext {
  dashboard: UserCoursesResult | null;
  loading: boolean;
  refresh: () => void;
}

const NAV = [
  { label: "我的課表", to: "/user/dashboard" },
  { label: "會員資料", to: "/user/profile" },
  { label: "購買紀錄", to: "/user/orders" },
  { label: "成為教練", to: "/user/become-coach" },
];

export function UserLayout() {
  const location = useLocation();
  const [dashboard, setDashboard] = useState<UserCoursesResult | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    getUserCourses()
      .then(({ data }) => setDashboard(data))
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeCount = dashboard?.course_booking.filter((b) => !b.cancelled_at).length ?? 0;
  const total = dashboard ? dashboard.credit_remain + dashboard.credit_usage : 0;
  const remainPct = total > 0 ? Math.round(((dashboard?.credit_remain ?? 0) / total) * 100) : 0;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-10 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-1 md:sticky md:top-10 md:self-start">
        <div className="px-3.5 pb-3.5 font-mono text-[11px] tracking-widest text-[#57524c]">MEMBER</div>
        {NAV.map((item) => {
          const on = location.pathname === item.to || (item.to === "/user/dashboard" && location.pathname === "/user");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between rounded-[4px] border-l-2 px-3.5 py-3 text-sm font-medium ${
                on ? "border-brand-500 bg-brand-500/10 text-[#ffb494]" : "border-transparent text-muted hover:text-body"
              }`}
            >
              {item.label}
              {item.to === "/user/dashboard" && activeCount > 0 && (
                <span className="font-mono text-[11px] text-[#57524c]">{activeCount}</span>
              )}
            </Link>
          );
        })}
        <div className="mt-6 rounded-md border border-line bg-surface p-5">
          <div className="font-mono text-[11px] tracking-wider text-[#8a857f]">CREDITS</div>
          <div className="mt-3.5 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-black tracking-tight text-brand-500">
              {dashboard ? dashboard.credit_remain : "–"}
            </span>
            <span className="text-[13px] text-[#8a857f]">堂可用</span>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand-500" style={{ width: `${remainPct}%` }} />
          </div>
          <div className="mt-2.5 text-xs font-light text-faint">
            已使用 {dashboard ? dashboard.credit_usage : "–"} 堂 / 共 {total} 堂
          </div>
          <Link
            to="/fitness-plans"
            className="mt-4.5 block w-full rounded-[4px] border border-brand-500 py-2.5 text-center text-[13px] font-bold text-brand-500 hover:bg-brand-500/10"
          >
            加購堂數
          </Link>
        </div>
      </aside>
      <section>
        <Outlet context={{ dashboard, loading, refresh } satisfies UserLayoutContext} />
      </section>
    </div>
  );
}
