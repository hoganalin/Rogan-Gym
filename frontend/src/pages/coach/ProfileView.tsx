import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getCoachSelf, putCoachSelf } from "../../api/coach";
import { getSkills } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import { useAuth } from "../../context/AuthContext";
import { CoachMedia } from "../../components/CoachMedia";
import type { Skill } from "../../types/api";

export default function ProfileView() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      .catch(() => {
        if (!cancelled) setError("載入教練檔案失敗，請稍後再試。");
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

  if (loading) return <p className="text-muted">載入中…</p>;
  if (error) return <p className="text-rose-400">{error}</p>;

  const selectedSkillNames = skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
      <div>
        <h1 className="font-display text-[34px] font-extrabold tracking-tight">教練檔案</h1>
        <p className="mt-3 text-sm font-light text-muted">
          維護個人簡介、經歷年資與技能標籤。右側即時預覽你在教練列表上的樣子。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-[560px] flex-col gap-5">
          <label className="block">
            <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">教學經驗（年）</span>
            <input
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500"
              required
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">自我介紹</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-2.5 w-full resize-y rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] leading-relaxed text-body outline-none focus:border-brand-500"
              required
            />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">個人照片網址（需 https）</span>
            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://"
              pattern="https://.*"
              className="mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] font-mono text-sm text-body outline-none focus:border-brand-500"
              required
            />
          </label>

          <div>
            <span className="font-mono text-[11px] tracking-wider text-[#8a857f]">技能標籤</span>
            {skills.length === 0 && (
              <p className="mt-2 text-sm font-light text-faint">尚無技能標籤，請先在「技能標籤」頁新增。</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => {
                const on = skillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`flex items-center gap-2 rounded-[4px] px-[15px] py-[11px] text-sm font-medium ${
                      on ? "border border-brand-500 bg-brand-500/10 text-[#ffb494]" : "border border-[#2a2d33] text-muted"
                    }`}
                  >
                    <span className="text-[10px]">{on ? "✓" : "＋"}</span>
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[4px] bg-brand-500 px-[34px] py-[15px] text-[15px] font-bold text-ink hover:bg-brand-400 disabled:opacity-50"
            >
              儲存變更
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-md border border-line bg-[#0a0b0c] p-[22px] lg:sticky lg:top-10 lg:self-start">
        <div className="font-mono text-[11px] tracking-wider text-[#57524c]">LIVE PREVIEW — 教練列表卡片</div>
        <div className="mt-[18px] overflow-hidden rounded-md border border-line bg-surface">
          <div className="relative h-[240px] bg-[#16181b]">
            <CoachMedia src={profileImageUrl || null} name={user?.name ?? "教"} className="h-full w-full" />
            <span className="absolute top-3.5 right-3.5 rounded-[3px] border border-[#2f3238] bg-ink/70 px-2.5 py-1.5 font-mono text-[11px] text-brand-500">
              {experienceYears || 0}Y
            </span>
          </div>
          <div className="p-5">
            <div className="text-xl font-bold">{user?.name}</div>
            <p className="mt-2.5 text-[13px] leading-relaxed font-light text-[#8a857f]">{description}</p>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {selectedSkillNames.map((sk) => (
                <span key={sk} className="rounded-[3px] border border-[#2a2d33] px-2.5 py-1 text-[11px] text-[#cfc9c2]">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
