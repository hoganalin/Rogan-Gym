import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getUserProfile, putUserProfile, putUserPassword } from "../../api/users";
import { extractErrorMessage } from "../../lib/errors";
import { Button, Field, StatusText, WorkspaceHeading } from "../../components/ClubUI";

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

  if (loading) return <StatusText>載入中…</StatusText>;

  return (
    <div>
      <WorkspaceHeading title="會員資料" />

      <form onSubmit={handleNameSubmit} className="mt-8 flex max-w-[420px] flex-col gap-4.5">
        <div className="font-mono text-[11px] tracking-widest text-muted">基本資料</div>
        <Field label="EMAIL">
          <input value={email} disabled />
        </Field>
        <Field label="暱稱">
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Button type="submit" className="mt-1 w-fit">
          儲存暱稱
        </Button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-12 flex max-w-[420px] flex-col gap-4.5">
        <div className="font-mono text-[11px] tracking-widest text-muted">修改密碼</div>
        <Field label="目前密碼">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Field label="新密碼">
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </Field>
        <Field label="確認新密碼">
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" className="mt-1 w-fit">
          更新密碼
        </Button>
      </form>
    </div>
  );
}
