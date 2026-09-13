import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getCoachSelf, putCoachSelf } from "../../api/coach";
import { getSkills } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import type { Skill } from "../../types/api";

export default function ProfileView() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCoachSelf(), getSkills()])
      .then(([coachRes, skillsRes]) => {
        if (cancelled) return;
        setExperienceYears(String(coachRes.data.experience_years));
        setDescription(coachRes.data.description);
        setProfileImageUrl(coachRes.data.profile_image_url ?? "");
        setSkillIds(coachRes.data.skill_ids);
        setSkills(skillsRes.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSkill(skillId: string) {
    setSkillIds((prev) => (prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await putCoachSelf({
        skill_ids: skillIds,
        experience_years: Number(experienceYears),
        description,
        profile_image_url: profileImageUrl,
      });
      setExperienceYears(String(data.experience_years));
      setDescription(data.description);
      setProfileImageUrl(data.profile_image_url ?? "");
      setSkillIds(data.skill_ids);
      await Swal.fire({ icon: "success", title: "檔案已更新" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "更新失敗", text: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">教練檔案</h1>
      <p className="mt-2 text-slate-600">維護個人簡介、經歷年資與技能標籤。</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
        <label className="block text-sm">
          教學經驗（年）
          <input
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          自我介紹
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            rows={4}
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          個人照片網址（需以 https 開頭）
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="https://"
            pattern="https://.*"
            required
          />
        </label>

        <fieldset className="mt-3">
          <legend className="text-sm">技能標籤</legend>
          {skills.length === 0 && (
            <p className="mt-1 text-sm text-slate-500">尚無技能標籤，請先在「技能標籤」頁新增。</p>
          )}
          <div className="mt-1 flex flex-wrap gap-3">
            {skills.map((skill) => (
              <label key={skill.id} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={skillIds.includes(skill.id)} onChange={() => toggleSkill(skill.id)} />
                {skill.name}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          儲存
        </button>
      </form>
    </div>
  );
}
