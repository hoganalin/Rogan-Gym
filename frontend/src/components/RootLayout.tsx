import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-bold text-brand-600">
            R Fitness
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/coaches">教練列表</Link>
            <Link to="/fitness-plans">健身方案</Link>
            {user?.role === "USER" && <Link to="/user/dashboard">我的課表</Link>}
            {user?.role === "COACH" && <Link to="/coach/profile">教練後台</Link>}
            {user ? (
              <button onClick={logout} className="text-brand-600">
                登出（{user.name}）
              </button>
            ) : (
              <>
                <Link to="/login">登入</Link>
                <Link to="/signup">註冊</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} R Fitness
      </footer>
    </div>
  );
}
