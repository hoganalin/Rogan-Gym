import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Brand, Icon } from "../../../components/ClubUI";
export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const destination =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await login({ email, password });
      navigate(destination);
    } catch {
      setError("登入失敗，請確認電子郵件與密碼，再試一次。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <Brand />
        <div className="auth-form-wrap">
          <h1>歡迎回來。</h1>
          <p>
            {next
              ? "登入後回到剛才的頁面，繼續完成預約。"
              : "今天，也為自己留一點訓練的時間。"}
          </p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              電子郵件
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              密碼
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入你的密碼"
                required
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "登入中…" : "登入"}
              <Icon />
            </button>
          </form>
          <p>
            還沒有帳號？{" "}
            <Link
              to={`/signup${next ? `?next=${encodeURIComponent(destination)}` : ""}`}
            >
              加入 R Fitness
            </Link>
          </p>
        </div>
        <p className="auth-bottom">
          © {new Date().getFullYear()} R Fitness · 把運動，練成日常。
        </p>
      </div>
      <aside className="auth-photo">
        <img src="/assets/editorial/runner.webp" alt="" />
        <div className="auth-photo-copy">
          <h2>
            每一次回來，
            <br />
            都是向前一步。
          </h2>
          <p>找到教練、安排課表，持續累積你的訓練。</p>
        </div>
      </aside>
    </div>
  );
}
