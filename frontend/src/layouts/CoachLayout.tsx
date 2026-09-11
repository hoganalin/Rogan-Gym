import { Link, Outlet } from "react-router-dom";

export function CoachLayout() {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-8">
      <aside className="flex flex-col gap-2 text-sm">
        <Link to="/coach/profile">教練檔案</Link>
        <Link to="/coach/courses">課程管理</Link>
        <Link to="/coach/earnings">營收報表</Link>
        <Link to="/coach/skills">技能標籤</Link>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
