import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function SignupView() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signup({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError("註冊失敗，請確認欄位是否符合規則（密碼需 8-16 碼含大小寫英數字）。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">註冊</h1>
      <label className="mt-4 block text-sm">
        姓名
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
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
        註冊
      </button>
    </form>
  );
}
