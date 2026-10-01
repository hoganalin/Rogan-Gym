import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import dayjs from "dayjs";
import { getCoachCourseList, getMonthlyRevenue } from "../api/coach";
import { getSkills } from "../api/skill";
import { Icon } from "../components/ClubUI";
const NAV=[{label:"課程管理",to:"/coach/courses"},{label:"教練檔案",to:"/coach/profile"},{label:"營收報表",to:"/coach/earnings"},{label:"技能標籤",to:"/coach/skills"}];
export interface CoachLayoutContext {refreshSummary:()=>void;}
export function CoachLayout(){
 const [courseCount,setCourseCount]=useState<number|null>(null);
 const [skillCount,setSkillCount]=useState<number|null>(null);
 const [revenue,setRevenue]=useState<number|null>(null);
 const refreshSummary=useCallback(()=>{const month=dayjs().format("MMMM").toLowerCase();Promise.all([getCoachCourseList(),getSkills(),getMonthlyRevenue(month)]).then(([c,s,r])=>{setCourseCount(c.data.length);setSkillCount(s.data.length);setRevenue(r.data.total.revenue);}).catch(()=>{setCourseCount(null);setSkillCount(null);setRevenue(null);});},[]);
 useEffect(()=>{refreshSummary();},[refreshSummary]);
 return <div className="editorial-workspace"><header className="workspace-banner coach-banner"><div className="club-container workspace-banner-inner"><div><p className="workspace-title">MAKE AN IMPACT.</p><p>專注教學，其餘在這裡安排。</p></div><Link className="btn btn-yellow" to="/coach/courses">管理我的課程<Icon/></Link></div></header><div className="club-container"><div className="workspace-overview"><div><span>本月營收</span><strong><small>NT$</small>{revenue?.toLocaleString()??"—"}</strong><Link to="/coach/earnings">查看報表<Icon size={16}/></Link></div><div><span>已建立課程</span><strong>{courseCount??"—"}<small>堂</small></strong><span>編輯時段與上課資訊</span></div><div><span>平台技能標籤</span><strong>{skillCount??"—"}<small>項</small></strong><span>維護課程與教練專項</span></div></div><nav className="workspace-tabs" aria-label="教練工作區">{NAV.map(item=><NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}</nav><section className="workspace-body"><Outlet context={{refreshSummary} satisfies CoachLayoutContext}/></section></div></div>;
}
