import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
    } catch (err) {
      setError("登入失敗，請確認帳號密碼是否正確。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">登入</h1>
      <label className="mt-4 block text-sm">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      <label className="mt-4 block text-sm">
        密碼
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <button type="submit" className="mt-6 w-full rounded bg-brand-600 py-2 text-white">
        登入
      </button>
    </form>
  );
}
