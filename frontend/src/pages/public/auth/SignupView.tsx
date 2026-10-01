import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Brand, Icon } from "../../../components/ClubUI";
export default function SignupView() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const loginPath = `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  const [name, setName] = useState("");
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
      await signup({ name, email, password });
      navigate(loginPath);
    } catch {
      setError(
        "註冊失敗，請確認欄位是否符合規則，或使用其他電子郵件再試一次。",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <Brand />
        <div className="auth-form-wrap">
          <h1>從這一堂，開始。</h1>
          <p>建立帳號，找到適合你的教練與訓練節奏。</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              姓名
              <input
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的姓名"
                required
              />
            </label>
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
                autoComplete="new-password"
                minLength={8}
                maxLength={16}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,16}"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-help"
                required
              />
              <small id="password-help">
                8–16 碼，需包含大小寫英文與數字。
              </small>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "建立帳號中…" : "註冊"}
              <Icon />
            </button>
          </form>
          <p>
            已經有帳號？ <Link to={loginPath}>登入</Link>
          </p>
        </div>
        <p className="auth-bottom">
          © {new Date().getFullYear()} R Fitness · 把運動，練成日常。
        </p>
      </div>
      <aside className="auth-photo">
        <img src="/assets/editorial/balance.webp" alt="" />
        <div className="auth-photo-copy">
          <h2>
            你的步調，
            <br />
            就是最好的起點。
          </h2>
          <p>選擇喜歡的課，把時間留給更好的自己。</p>
        </div>
      </aside>
    </div>
  );
}
