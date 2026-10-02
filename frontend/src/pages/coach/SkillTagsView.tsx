import { useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import { getSkills, postSkill, deleteSkill } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import type { CoachLayoutContext } from "../../layouts/CoachLayout";
import type { Skill } from "../../types/api";
import { Button, StatusText, WorkspaceHeading } from "../../components/ClubUI";

export default function SkillTagsView() {
  const { refreshSummary } = useOutletContext<CoachLayoutContext>();
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
      refreshSummary();
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
      refreshSummary();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "刪除失敗", text: extractErrorMessage(err) });
    }
  }

  if (loading) return <StatusText>載入中…</StatusText>;
  if (error) return <StatusText error>{error}</StatusText>;

  return (
    <div>
      <WorkspaceHeading title="技能標籤">新增或移除課程與教練檔案可選用的技能標籤。</WorkspaceHeading>

      <form onSubmit={handleAdd} className="mt-8 flex max-w-[420px] gap-3">
        <label className="sr-only" htmlFor="skill-name">
          技能名稱
        </label>
        <input
          id="skill-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="技能名稱"
          className="field-control flex-1"
          required
        />
        <Button type="submit" className="shrink-0">
          新增
        </Button>
      </form>

      {skills.length === 0 && <StatusText className="mt-8">目前沒有技能標籤。</StatusText>}

      <ul className="mt-8 flex max-w-[420px] flex-col gap-2.5">
        {skills.map((skill) => (
          <li
            key={skill.id}
            className="flex items-center justify-between rounded-(--radius-control) border border-line bg-surface px-4 py-3"
          >
            <span>{skill.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(skill)}
              className="btn-ghost-danger"
              aria-label={`刪除 ${skill.name}`}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
