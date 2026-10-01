import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { getUserCourses } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { Icon } from "../components/ClubUI";
import type { UserCoursesResult } from "../types/api";
export interface UserLayoutContext { dashboard: UserCoursesResult | null; loading: boolean; refresh: () => void; }
const NAV = [{ label: "我的課表", to: "/user/dashboard" }, { label: "會員資料", to: "/user/profile" }, { label: "購買紀錄", to: "/user/orders" }, { label: "成為教練", to: "/user/become-coach" }];
export function UserLayout() {
 const { user } = useAuth();
 const [dashboard, setDashboard] = useState<UserCoursesResult | null>(null);
 const [loading, setLoading] = useState(true);
 const refresh = useCallback(() => { setLoading(true); getUserCourses().then(({data})=>setDashboard(data)).catch(()=>setDashboard(null)).finally(()=>setLoading(false)); },[]);
 useEffect(()=>{refresh();},[refresh]);
 const active = dashboard?.course_booking.filter(b=>!b.cancelled_at && Date.parse(b.end_at)>Date.now()).length ?? 0;
 return <div className="editorial-workspace"><header className="workspace-banner"><div className="club-container workspace-banner-inner"><div><p className="workspace-title">YOUR NEXT MOVE.</p><p>{user?.name}，把下一步留給自己。</p></div><Link to="/schedule" className="btn btn-yellow">預約下一堂<Icon /></Link></div></header><div className="club-container"><div className="workspace-overview"><div><span>可用堂數</span><strong>{dashboard?.credit_remain ?? "—"}<small>堂</small></strong><Link to="/fitness-plans">加購堂數<Icon size={16}/></Link></div><div><span>待上課程</span><strong>{dashboard ? active : "—"}<small>堂</small></strong><span>在下方課表管理預約</span></div><div><span>累積使用</span><strong>{dashboard?.credit_usage ?? "—"}<small>堂</small></strong><span>每一次訓練，都算數。</span></div></div><nav className="workspace-tabs" aria-label="會員中心">{NAV.map(item=><NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}</nav><section className="workspace-body"><Outlet context={{dashboard,loading,refresh} satisfies UserLayoutContext}/></section></div></div>;
}
