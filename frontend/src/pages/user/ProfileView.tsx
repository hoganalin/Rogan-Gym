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

  if (loading) return <p className="text-muted">載入中…</p>;

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-tight">會員資料</h1>

      <form onSubmit={handleNameSubmit} className="mt-8 flex max-w-[420px] flex-col gap-4.5">
        <div className="font-mono text-[11px] tracking-widest text-[#57524c]">基本資料</div>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">EMAIL</span>
          <input
            value={email}
            disabled
            className="mt-2.5 w-full rounded-[4px] border border-[#22242a] bg-[#0f1012] px-4 py-[14px] text-faint outline-none"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">暱稱</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-fit rounded-[4px] bg-brand-500 px-[26px] py-3 text-sm font-bold text-ink hover:bg-brand-400"
        >
          儲存暱稱
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-12 flex max-w-[420px] flex-col gap-4.5">
        <div className="font-mono text-[11px] tracking-widest text-[#57524c]">修改密碼</div>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">目前密碼</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
            required
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">新密碼</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
            required
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">確認新密碼</span>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-1 w-fit rounded-[4px] bg-brand-500 px-[26px] py-3 text-sm font-bold text-ink hover:bg-brand-400"
        >
          更新密碼
        </button>
      </form>
    </div>
  );
}
