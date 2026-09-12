import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getUserProfile, putUserProfile, putUserPassword } from "../../api/users";
import { extractErrorMessage } from "../../lib/errors";

export default function ProfileView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    getUserProfile()
      .then(({ data }) => {
        if (cancelled) return;
        setName(data.user.name);
        setEmail(data.user.email);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const { data } = await putUserProfile({ name });
      setName(data.user.name);
      await Swal.fire({ icon: "success", title: "暱稱已更新" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "更新失敗", text: extractErrorMessage(err) });
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await putUserPassword({
        password,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      await Swal.fire({ icon: "success", title: "密碼已更新" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "更新失敗", text: extractErrorMessage(err) });
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">會員資料</h1>

      <form onSubmit={handleNameSubmit} className="mt-6 max-w-sm">
        <h2 className="font-semibold">基本資料</h2>
        <label className="mt-3 block text-sm text-slate-500">
          Email
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400"
          />
        </label>
        <label className="mt-3 block text-sm">
          暱稱
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white">
          儲存暱稱
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-10 max-w-sm">
        <h2 className="font-semibold">修改密碼</h2>
        <label className="mt-3 block text-sm">
          目前密碼
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          新密碼
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          確認新密碼
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white">
          更新密碼
        </button>
      </form>
    </div>
  );
}
