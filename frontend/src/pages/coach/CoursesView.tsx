import { useEffect, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { getCoachCourseList, getCoachCourseDetail, postCoachCourse, putCoachCourse } from "../../api/coach";
import { getSkills } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { CoachLayoutContext } from "../../layouts/CoachLayout";
import type { CoachCourseListItem, Skill } from "../../types/api";

interface CourseFormState {
  skillId: string;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  maxParticipants: string;
  meetingUrl: string;
}

const emptyForm: CourseFormState = {
  skillId: "",
  name: "",
  description: "",
  startAt: "",
  endAt: "",
  maxParticipants: "",
  meetingUrl: "",
};

const inputClass =
  "mt-2.5 w-full rounded-[4px] border border-[#2a2d33] bg-surface px-4 py-[14px] text-body outline-none focus:border-brand-500";
const labelClass = "font-mono text-[11px] tracking-wider text-[#8a857f]";

export default function CoursesView() {
  const { refreshSummary } = useOutletContext<CoachLayoutContext>();
  const [courses, setCourses] = useState<CoachCourseListItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCourses() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getCoachCourseList();
      setCourses(data);
    } catch {
      setError("載入課程失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    getSkills().then(({ data }) => setSkills(data));
  }, []);

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setMode("create");
  }

  async function startEdit(courseId: string) {
    try {
      const { data } = await getCoachCourseDetail(courseId);
      setForm({
        skillId: data.skill_id,
        name: data.name,
        description: data.description,
        startAt: dayjs(data.start_at).format("YYYY-MM-DDTHH:mm"),
        endAt: dayjs(data.end_at).format("YYYY-MM-DDTHH:mm"),
        maxParticipants: String(data.max_participants),
        meetingUrl: data.meeting_url,
      });
      setEditingId(courseId);
      setMode("edit");
    } catch (err) {
      await Swal.fire({ icon: "error", title: "載入課程失敗", text: extractErrorMessage(err) });
    }
  }

  function cancelForm() {
    setMode("list");
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      skill_id: form.skillId,
      name: form.name,
      description: form.description,
      start_at: dayjs(form.startAt).toISOString(),
      end_at: dayjs(form.endAt).toISOString(),
      max_participants: Number(form.maxParticipants),
      meeting_url: form.meetingUrl,
    };

    try {
      if (mode === "edit" && editingId) {
        await putCoachCourse(editingId, payload);
        await Swal.fire({ icon: "success", title: "課程已更新" });
      } else {
        await postCoachCourse(payload);
        await Swal.fire({ icon: "success", title: "課程已建立" });
      }
      setMode("list");
      setEditingId(null);
      loadCourses();
      refreshSummary();
    } catch (err) {
      await Swal.fire({ icon: "error", title: "儲存失敗", text: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted">載入中…</p>;
  if (error) return <p className="text-rose-400">{error}</p>;

  if (mode === "create" || mode === "edit") {
    return (
      <div>
        <h1 className="font-display text-[34px] font-extrabold tracking-tight">
          {mode === "edit" ? "編輯課程" : "新增課程"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-[480px] flex-col gap-4.5">
          <label className="block">
            <span className={labelClass}>技能標籤</span>
            <select
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
              className={inputClass}
              required
            >
              <option value="" disabled>
                請選擇
              </option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>課程名稱</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>課程說明</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${inputClass} resize-y leading-relaxed`}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>開始時間</span>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>結束時間</span>
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>人數上限</span>
            <input
              type="number"
              min={0}
              value={form.maxParticipants}
              onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="block">
            <span className={labelClass}>會議連結（需以 https 開頭）</span>
            <input
              type="url"
              value={form.meetingUrl}
              onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
              placeholder="https://"
              pattern="https://.*"
              className={`${inputClass} font-mono text-sm`}
              required
            />
          </label>

          <div className="mt-1 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[4px] bg-brand-500 px-[26px] py-3 text-sm font-bold text-ink hover:bg-brand-400 disabled:opacity-50"
            >
              儲存
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-[4px] border border-[#2a2d33] px-[26px] py-3 text-sm font-medium text-muted hover:text-body"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[34px] font-extrabold tracking-tight">課程管理</h1>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-[4px] bg-brand-500 px-[22px] py-3 text-sm font-bold text-ink hover:bg-brand-400"
        >
          新增課程
        </button>
      </div>
      <p className="mt-3 text-sm font-light text-muted">新增、編輯你開設的課程。</p>

      {courses.length === 0 && <p className="mt-8 text-muted">目前沒有課程。</p>}

      <div className="mt-8 flex flex-col gap-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-md border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">{course.name}</h3>
                <p className="mt-1.5 font-mono text-xs text-[#8a857f]">
                  {formatCourseTime(course.start_at, course.end_at)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {course.status} · {course.participants}/{course.max_participants} 人
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(course.id)}
                className="shrink-0 rounded-[4px] border border-[#2a2d33] px-[18px] py-2.5 text-sm font-medium text-muted hover:text-body"
              >
                編輯
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
