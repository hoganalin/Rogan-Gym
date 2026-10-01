import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Brand, Icon } from "./ClubUI";
const links = [
  { to: "/coaches", label: "找教練" },
  { to: "/schedule", label: "選課與預約" },
  { to: "/fitness-plans", label: "堂數方案" },
];
export function RootLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">
        跳至主要內容
      </a>
      <header className="site-header">
        <div className="club-container header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="主要導覽">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link
                  className="account-link"
                  to={
                    user.role === "COACH" ? "/coach/courses" : "/user/dashboard"
                  }
                >
                  {user.role === "COACH" ? "教練工作區" : "我的課表"}
                </Link>
                <button className="quiet-button" onClick={logout}>
                  登出
                </button>
              </>
            ) : (
              <>
                <Link className="login-link" to="/login">
                  登入
                </Link>
                <Link className="btn btn-primary join-link" to="/signup">
                  加入會員 <Icon size={16} />
                </Link>
              </>
            )}
            <button
              className="menu-toggle"
              aria-label={open ? "關閉導覽" : "開啟導覽"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="手機導覽"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {links.map((l) => (
              <NavLink to={l.to} key={l.to}>
                {l.label}
                <Icon />
              </NavLink>
            ))}
            {!user && (
              <Link to="/signup">
                加入會員
                <Icon />
              </Link>
            )}
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="club-container footer-main">
          <div>
            <Brand />
            <p>
              找到適合的教練，
              <br />
              讓每一次訓練都有方向。
            </p>
          </div>
          <nav aria-label="探索訓練">
            <h2>開始你的訓練</h2>
            {links.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="會員服務">
            <h2>你的 R Fitness</h2>
            <Link to="/user/dashboard">我的課表</Link>
            <Link to="/user/orders">購買紀錄</Link>
            <Link to="/user/become-coach">成為教練</Link>
          </nav>
          <p className="footer-statement">
            Make room
            <br />
            for movement.
          </p>
        </div>
        <div className="club-container footer-bottom">
          <span>© {new Date().getFullYear()} R Fitness</span>
          <span>依你的步調，持續向前。</span>
        </div>
      </footer>
    </div>
  );
}
