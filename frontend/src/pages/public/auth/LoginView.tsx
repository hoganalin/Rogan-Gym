import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch {
      setError("登入失敗，請確認帳號密碼是否正確。");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-[708px] overflow-hidden rounded-md border border-line bg-[#0c0d0e]">
        <div className="relative hidden w-[260px] shrink-0 bg-[#16181b] sm:block">
          <img src="/assets/auth-login.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(12,13,14,0) 40%, rgba(12,13,14,.9) 100%)" }}
          />
          <div className="absolute bottom-6 left-6 font-display text-[22px] leading-[1.1] font-black tracking-tight">
            WELCOME
            <br />
            BACK.
          </div>
        </div>

        <div className="flex-1 box-border p-11">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/assets/logo-mark.png" alt="" className="h-[30px] w-[30px] rounded-[5px] object-cover" />
            <span className="font-display text-lg font-black tracking-tight">
              R<span className="mx-px" />FITNESS
            </span>
          </Link>
          <h1 className="mt-9 font-display text-[34px] font-extrabold tracking-tight">登入</h1>
          <p className="mt-2.5 text-sm font-light text-[#8a857f]">
            還沒有帳號？
            <Link to="/signup" className="text-brand-500 hover:text-brand-400">
              立即註冊
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <label className="block">
              <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">EMAIL</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[15px] text-body outline-none focus:border-brand-500"
                required
              />
            </label>
            <label className="block">
              <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">密碼</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[15px] text-body outline-none focus:border-brand-500"
                required
              />
            </label>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button
              type="submit"
              className="mt-2 w-full rounded-[4px] bg-brand-500 py-4 text-[15px] font-bold text-ink hover:bg-brand-400"
            >
              登入
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
