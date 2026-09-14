import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getSkills, postSkill, deleteSkill } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import type { Skill } from "../../types/api";

export default function SkillTagsView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  async function loadSkills() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getSkills();
      setSkills(data);
    } catch {
      setError("載入技能標籤失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    try {
      await postSkill(name);
      setName("");
      await Swal.fire({ icon: "success", title: "已新增技能標籤" });
      loadSkills();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "新增失敗", text: extractErrorMessage(err) });
    }
  }

  async function handleDelete(skill: Skill) {
    const result = await Swal.fire({
      title: `確定要刪除「${skill.name}」嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "刪除",
      cancelButtonText: "取消",
      confirmButtonColor: "#e11d48",
    });
    if (!result.isConfirmed) return;

    try {
      await deleteSkill(skill.id);
      await Swal.fire({ icon: "success", title: "已刪除" });
      loadSkills();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "刪除失敗", text: extractErrorMessage(err) });
    }
  }

  if (loading) return <p className="text-muted">載入中…</p>;
  if (error) return <p className="text-rose-400">{error}</p>;

  return (
    <div>
      <h1 className="font-display text-[34px] font-extrabold tracking-tight">技能標籤</h1>
      <p className="mt-3 text-sm font-light text-muted">新增或移除課程與教練檔案可選用的技能標籤。</p>

      <form onSubmit={handleAdd} className="mt-8 flex max-w-[420px] gap-3">
        <label className="sr-only" htmlFor="skill-name">
          技能名稱
        </label>
        <input
          id="skill-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="技能名稱"
          className="flex-1 rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
          required
        />
        <button type="submit" className="shrink-0 rounded-[4px] bg-brand-500 px-[22px] py-3 text-sm font-bold text-ink hover:bg-brand-400">
          新增
        </button>
      </form>

      {skills.length === 0 && <p className="mt-8 text-muted">目前沒有技能標籤。</p>}

      <ul className="mt-8 flex max-w-[420px] flex-col gap-2.5">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center justify-between rounded-[4px] border border-line bg-surface px-4 py-3"
          >
            <span>{skill.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(skill)}
              className="text-sm text-[#e8735c] hover:text-[#ff8a70]"
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
