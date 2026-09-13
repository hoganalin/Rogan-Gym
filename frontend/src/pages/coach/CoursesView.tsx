import { useEffect, useState, type FormEvent } from "react";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { getCoachCourseList, getCoachCourseDetail, postCoachCourse, putCoachCourse } from "../../api/coach";
import { getSkills } from "../../api/skill";
import { extractErrorMessage } from "../../lib/errors";
import { formatCourseTime } from "../../lib/formatDateTime";
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

export default function CoursesView() {
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
    } catch (err) {
      await Swal.fire({ icon: "error", title: "儲存失敗", text: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;

  if (mode === "create" || mode === "edit") {
    return (
      <div>
        <h1 className="text-2xl font-bold">{mode === "edit" ? "編輯課程" : "新增課程"}</h1>

        <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
          <label className="block text-sm">
            技能標籤
            <select
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
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
          <label className="mt-3 block text-sm">
            課程名稱
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="mt-3 block text-sm">
            課程說明
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              rows={3}
              required
            />
          </label>
          <label className="mt-3 block text-sm">
            開始時間
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="mt-3 block text-sm">
            結束時間
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="mt-3 block text-sm">
            人數上限
            <input
              type="number"
              min={0}
              value={form.maxParticipants}
              onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="mt-3 block text-sm">
            會議連結（需以 https 開頭）
            <input
              type="url"
              value={form.meetingUrl}
              onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="https://"
              pattern="https://.*"
              required
            />
          </label>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              儲存
            </button>
            <button type="button" onClick={cancelForm} className="rounded border border-slate-300 px-4 py-2 text-sm">
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
        <h1 className="text-2xl font-bold">課程管理</h1>
        <button type="button" onClick={startCreate} className="rounded bg-brand-600 px-4 py-2 text-sm text-white">
          新增課程
        </button>
      </div>
      <p className="mt-2 text-slate-600">新增、編輯你開設的課程。</p>

      {courses.length === 0 && <p className="mt-6 text-slate-500">目前沒有課程。</p>}

      <div className="mt-6 flex flex-col gap-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{formatCourseTime(course.start_at, course.end_at)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {course.status}・{course.participants}/{course.max_participants} 人
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(course.id)}
                className="shrink-0 rounded border border-slate-300 px-4 py-2 text-sm"
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
