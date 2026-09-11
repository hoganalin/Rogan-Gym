import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-8">
      <aside className="flex flex-col gap-2 text-sm">
        <Link to="/user/dashboard">我的課表</Link>
        <Link to="/user/profile">會員資料</Link>
        <Link to="/user/orders">購買紀錄</Link>
        <Link to="/user/become-coach">成為教練</Link>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
