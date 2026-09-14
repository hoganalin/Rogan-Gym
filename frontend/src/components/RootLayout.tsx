import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FOOTER_COLS: { title: string; items: { label: string; to: string }[] }[] = [
  {
    title: "PLATFORM",
    items: [
      { label: "教練列表", to: "/coaches" },
      { label: "課程時間表", to: "/" },
      { label: "健身方案", to: "/fitness-plans" },
      { label: "成為教練", to: "/user/become-coach" },
    ],
  },
  {
    title: "會員",
    items: [
      { label: "登入", to: "/login" },
      { label: "註冊", to: "/signup" },
      { label: "我的課表", to: "/user/dashboard" },
      { label: "購買紀錄", to: "/user/orders" },
    ],
  },
];

const CONTACT_LINES = ["service@rfitness.tw", "02-2700-0000", "台北市信義區", "營業時間 06:00–23:00"];

export function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-ink text-body">
      <header data-nav="1" className="sticky top-0 z-20 border-b border-[#1d1f24] bg-[#0c0d0e]/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/logo-mark.png" alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
            <span className="font-display text-xl font-black tracking-tight">
              R<span className="mx-px" />FITNESS
            </span>
          </Link>
          <div className="flex items-center gap-8 text-sm font-medium">
            <Link to="/coaches" className="hidden text-body hover:text-brand-400 sm:inline">
              教練列表
            </Link>
            <Link to="/" className="hidden text-body hover:text-brand-400 sm:inline">
              課程時間表
            </Link>
            <Link to="/fitness-plans" className="hidden text-body hover:text-brand-400 sm:inline">
              健身方案
            </Link>
            <span className="hidden h-[18px] w-px bg-[#2a2d33] sm:inline" />
            {user ? (
              <>
                {user.role === "USER" && (
                  <Link to="/user/dashboard" className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 font-display text-xs font-bold text-ink">
                      {user.name.charAt(0)}
                    </span>
                    <span className="hidden md:inline">{user.name}</span>
                  </Link>
                )}
                {user.role === "COACH" && (
                  <Link to="/coach/profile" className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 font-display text-xs font-bold text-ink">
                      {user.name.charAt(0)}
                    </span>
                    <span>教練後台</span>
                  </Link>
                )}
                <button type="button" onClick={logout} className="text-muted hover:text-brand-400">
                  登出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted hover:text-brand-400">
                  登入
                </Link>
                <Link
                  to="/signup"
                  className="rounded-[4px] bg-brand-500 px-[18px] py-2.5 font-bold text-ink hover:bg-brand-400"
                >
                  加入會員
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-24 border-t border-[#1d1f24] bg-[#0a0b0c]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img src="/assets/logo-mark.png" alt="" className="h-[46px] w-[46px] rounded-lg object-cover" />
              <div className="font-display text-2xl font-black tracking-tight">
                R<span className="mx-px" />FITNESS
              </div>
            </div>
            <p className="mt-4 max-w-[260px] text-sm leading-relaxed font-light text-faint">
              健身房課程預約平台。瀏覽教練、購買堂數、報名課程。
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[11px] tracking-widest text-[#57524c]">{col.title}</div>
              <div className="mt-4 flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <Link key={item.label} to={item.to} className="text-sm text-muted hover:text-brand-400">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div className="font-mono text-[11px] tracking-widest text-[#57524c]">CONTACT</div>
            <div className="mt-4 flex flex-col gap-2.5">
              {CONTACT_LINES.map((line) => (
                <span key={line} className="text-sm text-muted">
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl justify-between border-t border-[#1d1f24] px-6 py-6 font-mono text-[11px] text-[#4f4a45]">
          <span>© {new Date().getFullYear()} R FITNESS</span>
          <span>NODE.JS · EXPRESS · POSTGRESQL</span>
        </div>
      </footer>
    </div>
  );
}
