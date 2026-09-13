import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getSkills, postSkill, deleteSkill } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import type { Skill } from "../../types/api";

export default function SkillTagsView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  async function loadSkills() {
    setLoading(true);
    try {
      const { data } = await getSkills();
      setSkills(data);
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

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">技能標籤</h1>
      <p className="mt-2 text-slate-600">新增或移除課程與教練檔案可選用的技能標籤。</p>

      <form onSubmit={handleAdd} className="mt-6 flex max-w-sm gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="技能名稱"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          required
        />
        <button type="submit" className="rounded bg-brand-600 px-4 py-2 text-sm text-white">
          新增
        </button>
      </form>

      {skills.length === 0 && <p className="mt-6 text-slate-500">目前沒有技能標籤。</p>}

      <ul className="mt-6 flex flex-col gap-2">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
          >
            <span>{skill.name}</span>
            <button type="button" onClick={() => handleDelete(skill)} className="text-sm text-rose-600">
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
