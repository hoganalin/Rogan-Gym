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
import { Button, Field, StatusText, WorkspaceHeading } from "../../components/ClubUI";

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

  if (loading) return <StatusText>載入中…</StatusText>;
  if (error) return <StatusText error>{error}</StatusText>;

  if (mode === "create" || mode === "edit") {
    return (
      <div>
        <WorkspaceHeading title={mode === "edit" ? "編輯課程" : "新增課程"} />

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-[480px] flex-col gap-4.5">
          <Field label="技能標籤">
            <select
              value={form.skillId}
              onChange={(e) => setForm({ ...form, skillId: e.target.value })}
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
          </Field>
          <Field label="課程名稱">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="課程說明">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
            />
          </Field>
          <Field label="開始時間">
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              required
            />
          </Field>
          <Field label="結束時間">
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              required
            />
          </Field>
          <Field label="人數上限">
            <input
              type="number"
              min={0}
              value={form.maxParticipants}
              onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
              required
            />
          </Field>
          <Field label="上課地點連結（Google 地圖網址，需以 https 開頭）" mono>
            <input
              type="url"
              value={form.meetingUrl}
              onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=…"
              pattern="https://.*"
              required
            />
          </Field>

          <div className="mt-1 flex gap-3">
            <Button type="submit" disabled={saving}>
              儲存
            </Button>
            <Button variant="secondary" onClick={cancelForm}>
              取消
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <WorkspaceHeading title="課程管理" action={<Button onClick={startCreate}>新增課程</Button>}>
        新增、編輯你開設的課程。
      </WorkspaceHeading>

      {courses.length === 0 && <StatusText className="mt-8">目前沒有課程。</StatusText>}

      <div className="mt-8 flex flex-col gap-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-(--radius-control) border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">{course.name}</h3>
                <p className="mt-1.5 font-mono text-xs text-muted">
                  {formatCourseTime(course.start_at, course.end_at)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {course.status} · {course.participants}/{course.max_participants} 人
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => startEdit(course.id)}
                className="shrink-0"
                aria-label={`編輯 ${course.name}`}
              >
                編輯
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
