# R Fitness Coach Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder content of the four `/coach/*` pages (`ProfileView`, `CoursesView`, `EarningsView`, `SkillTagsView`) with real data and interactions — this is the last unbuilt route group in the React rewrite (see `docs/adr/0001-react-rewrite-for-portfolio.md` and `CONTEXT.md`).

**Architecture:** Same conventions as the already-merged Public Pages and Member Area plans: each page fetches its own data in `useEffect`/`useState`, `sweetalert2` handles confirm/success/error feedback, `extractErrorMessage` surfaces real backend errors, `dayjs` handles date formatting/parsing. No new hooks are needed — every mutation here (skill add/delete, profile save, course create/edit) is only ever triggered from exactly one place, so `Swal.fire` calls stay inline in each page (matching `ProfileView`/`BecomeCoachView` from the member-area plan), rather than being extracted into a shared hook (which was only done for booking/purchase actions because those are triggered from more than one page).

**Tech Stack:** React 19, TypeScript, react-router-dom, sweetalert2, dayjs, Recharts — all already installed, no new dependencies. The entire API client layer this plan needs (`frontend/src/api/coach.ts`, `frontend/src/api/skill.ts`) and every type it needs (`frontend/src/types/api.ts`) already exist and are correct — **this plan is pages-only**, it does not touch the API layer or types.

---

## Context for the engineer

- This continues on top of the already-merged Foundation, Public Pages, and Member Area plans. Read `docs/superpowers/plans/2026-09-12-r-fitness-member-area.md`'s "Context for the engineer" section for the unwrap convention (`const { data } = await someApiCall()`) and established page patterns — this plan follows them exactly.
- `frontend/src/pages/coach/{ProfileView,CoursesView,EarningsView,SkillTagsView}.tsx` currently render only a heading and one placeholder sentence. **Do not change their file paths, default-export names, or the routes in `frontend/src/App.tsx`.**
- The backend (`backend/`) must not be modified.
- **The real API path for every endpoint in this plan is `/api/admin/coaches/*`**, not `/api/coaches/*` — despite the frontend route being `/coach/*`. This is already correctly reflected in `frontend/src/api/coach.ts`; you never need to write a raw URL string yourself, only call the existing functions.
- **Skill tags are global, not per-coach.** `Skill` rows are shared across every coach in the system (any coach can see and delete any other coach's tags — the backend applies no ownership scoping to `/api/coaches/skill/*` at all, it's fully public with no auth middleware). This is intentional backend simplification, not something to "fix" on the frontend.
- **There is no delete-course endpoint.** The backend only supports create (`POST admin/coaches/courses`) and full-replace update (`PUT admin/coaches/courses/:id`) for courses — no `DELETE`. Do not add a delete-course button; the backend genuinely does not support it.
- **`PUT admin/coaches/courses/:id` requires every field on every save, not just the changed ones** — there is no partial update. The edit form must be fully pre-filled from `GET admin/coaches/courses/:id` before the coach can save anything.
- **`PUT admin/coaches` (profile save) requires `profile_image_url` to be a non-empty string starting with `https`, even though a freshly-promoted coach's `GET admin/coaches` can return `profile_image_url: null`.** The profile form's photo-URL field must be `required` so the coach is forced to supply a real URL before the first successful save — pre-filling from a `null` value and submitting unchanged would otherwise 400.
- **Course times.** The backend requires `start_at`/`end_at` as UTC ISO 8601 strings matching `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/`, with `end_at` strictly after `start_at`. An HTML `<input type="datetime-local">` gives a local-time string with no timezone info (e.g. `"2026-09-20T10:00"`); `dayjs(thatString).toISOString()` correctly converts it (dayjs parses a bare, timezone-less string as local time, and `.toISOString()` emits exactly the format the backend regex expects). For displaying an existing course's `start_at`/`end_at` (a UTC `Z` string from the backend) back into a `datetime-local` input's value, use `dayjs(isoString).format("YYYY-MM-DDTHH:mm")` (dayjs parses the `Z` string and formats it in local time, which is what the input widget expects) — both directions already used in the code below, don't invent a different date library or manual offset math.
- **Revenue month parameter.** `GET admin/coaches/revenue?month=<name>` wants an **English lowercase month name** (`"june"`, not `"6"` or `"2026-06"` or `"June"` — though the backend regex is actually case-insensitive, lowercase is used here for consistency) and always queries the **server's current calendar year** — there is no year parameter, so you cannot query a past year. The month is attributed by when the *booking* was made (`CourseBooking.created_at`), not the course's own date.
- **Revenue math, if you ever need to sanity-check the numbers by hand**: `averagePrice = (sum of every CreditPackage's price) / (sum of every CreditPackage's credit_amount)` across **all** packages system-wide (not just this coach's bookers' packages), then `revenue = floor(thisMonth'sNonCancelledBookingCount * averagePrice)` — multiply first, floor once, at the end. `course_count` in the response is misleadingly named: it's actually the same non-cancelled-booking count used in the multiplication, not a count of distinct courses.
- **Node process safety**: every task's manual-verification step that starts a dev server must stop only the exact PID it started. Never run `taskkill /IM node.exe /F` or any blanket kill-all-Node command — this has caused collateral damage on this machine before.

---

## File Structure

```
frontend/src/pages/coach/
├── SkillTagsView.tsx    (modify — full replacement, skill CRUD)
├── ProfileView.tsx      (modify — full replacement, profile + skill selection)
├── CoursesView.tsx      (modify — full replacement, list/create/edit)
└── EarningsView.tsx     (modify — full replacement, month picker + Recharts bar chart)
```

No other files change. `frontend/src/api/coach.ts`, `frontend/src/api/skill.ts`, and `frontend/src/types/api.ts` already have everything this plan needs.

---

## Task 1: Skill tag management

**Files:**
- Modify: `frontend/src/pages/coach/SkillTagsView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/coach/SkillTagsView.tsx`**

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using a fresh test user promoted to coach (sign up, then either use the `/user/become-coach` UI flow or seed directly: `curl -X POST http://127.0.0.1:8080/api/admin/coaches/<userId> -H "Content-Type: application/json" -d '{"experience_years":3,"description":"test","profile_image_url":"https://example.com/x.jpg"}'` — this endpoint has no auth middleware, then log in again to get a COACH-role token), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/coach/skills`.
2. Add a new skill with a unique name — confirm a success alert, confirm it appears in the list.
3. Add a skill with a name that already exists (any name currently shown in the list) — confirm an error alert with the real backend message (`資料重複`).
4. Delete the skill you just added — confirm a warning-confirm dialog, confirm it, confirm a success alert, confirm it disappears from the list.
5. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

**Never use a blanket `taskkill /IM node.exe /F`.**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/coach/SkillTagsView.tsx
git commit -m "feat(frontend): wire SkillTagsView to real skill tag CRUD"
```

Append this attribution trailer:
```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

## Task 2: Coach profile with skill selection

**Files:**
- Modify: `frontend/src/pages/coach/ProfileView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/coach/ProfileView.tsx`**

```tsx
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
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using the same coach test account from Task 1 (it should already have at least one skill tag from that task's verification — if not, add one via `/coach/skills` first), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/coach/profile` — confirm the form is pre-filled with the coach's current experience years, description, and (if set) photo URL, and the correct skill checkboxes are pre-checked.
2. Change the experience years, description, and check/uncheck a skill; submit — confirm a success alert, confirm the form still shows the updated values after the alert closes.
3. Reload the page — confirm the changes persisted (re-fetches from the backend, not just local state).
4. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/coach/ProfileView.tsx
git commit -m "feat(frontend): wire coach ProfileView to real profile and skill editing"
```

Append the attribution trailer (same as Task 1).

---

## Task 3: Course management — list, create, edit

**Files:**
- Modify: `frontend/src/pages/coach/CoursesView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/coach/CoursesView.tsx`**

```tsx
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
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadCourses() {
    setLoading(true);
    try {
      const { data } = await getCoachCourseList();
      setCourses(data);
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
```

Note: there is no delete button — the backend has no delete-course endpoint (see "Context for the engineer" above). `CoachCourseListItem.status`/`participants` are computed server-side at request time (not stored columns), so they always reflect the current moment — no client-side recomputation needed.

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using the same coach test account (needs at least one skill tag to exist, from Task 1), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/coach/courses` — confirm the empty state or existing course list renders.
2. Click "新增課程", fill in all fields (pick a start time in the future, end time at least a few minutes after start, `max_participants` e.g. `10`, `meeting_url` starting with `https://`), submit — confirm a success alert, confirm the new course appears in the list with the correct name, time range, and `尚未開始・0/10 人`.
3. Click "編輯" on that course, change the name and description, submit — confirm a success alert, confirm the list shows the updated name.
4. Submit the create form with an `end_at` before `start_at` — confirm an error alert with the real backend message (`欄位未填寫正確`).
5. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/coach/CoursesView.tsx
git commit -m "feat(frontend): wire CoursesView to real course list, create, and edit"
```

Append the attribution trailer (same as Task 1).

---

## Task 4: Earnings report with Recharts

**Files:**
- Modify: `frontend/src/pages/coach/EarningsView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/coach/EarningsView.tsx`**

The revenue endpoint only ever answers for the server's current calendar year, one month at a time — there's no "give me all 12 months" endpoint. To make a meaningful Recharts bar chart (rather than a chart with a single bar), this fetches all 12 months in parallel on mount and renders them together, with a month picker below the chart for viewing one month's participant/booking-count detail.

```tsx
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMonthlyRevenue } from "../../api/coach";

const MONTHS = [
  { value: "january", label: "1月" },
  { value: "february", label: "2月" },
  { value: "march", label: "3月" },
  { value: "april", label: "4月" },
  { value: "may", label: "5月" },
  { value: "june", label: "6月" },
  { value: "july", label: "7月" },
  { value: "august", label: "8月" },
  { value: "september", label: "9月" },
  { value: "october", label: "10月" },
  { value: "november", label: "11月" },
  { value: "december", label: "12月" },
];

interface MonthRevenue {
  month: string;
  label: string;
  revenue: number;
  participants: number;
  course_count: number;
}

export default function EarningsView() {
  const [data, setData] = useState<MonthRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>(MONTHS[0].value);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      MONTHS.map((m) =>
        getMonthlyRevenue(m.value).then((res) => ({
          month: m.value,
          label: m.label,
          revenue: res.data.total.revenue,
          participants: res.data.total.participants,
          course_count: res.data.total.course_count,
        })),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        setData(results);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-slate-500">載入中…</p>;

  const current = data.find((d) => d.month === selected);

  return (
    <div>
      <h1 className="text-2xl font-bold">營收報表</h1>
      <p className="mt-2 text-slate-600">查看今年各月份的營收統計。</p>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#ea580c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-6 block max-w-xs text-sm">
        選擇月份查看明細
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      {current && (
        <div className="mt-4 flex gap-6 text-sm text-slate-600">
          <p>
            營收：<span className="font-semibold text-brand-600">${current.revenue}</span>
          </p>
          <p>參與人次：{current.participants}</p>
          <p>報名數：{current.course_count}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using the coach test account that already has at least one course from Task 3 (a course with zero bookings is fine — the chart and detail panel should just show zeros for that month, not error), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/coach/earnings` — confirm the bar chart renders with 12 bars (one per month) without throwing, and the month picker defaults to January.
2. Change the month picker to a different month — confirm the revenue/participants/報名數 numbers below update to match that month's bar.
3. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/coach/EarningsView.tsx
git commit -m "feat(frontend): wire EarningsView to real monthly revenue with a Recharts bar chart"
```

Append the attribution trailer (same as Task 1).

---

## Task 5: Full end-to-end walkthrough

**Files:** none (verification only)

- [ ] **Step 1: Type-check and build the whole frontend**

```bash
cd frontend && npx tsc -b && npm run build
```

Expected: zero errors, `dist/` produced.

- [ ] **Step 2: Walk the full coach-area journey against the real backend**

Using a fresh user promoted to coach (sign up, then promote via `/user/become-coach` or the direct `curl` call documented in Task 1's verification step, then log back in so the session token carries the `COACH` role), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):

1. Log in — confirm the nav bar shows "教練後台" and `/coach/profile` is reachable.
2. `/coach/skills` — add a new skill tag, confirm it appears.
3. `/coach/profile` — fill in experience years, description, a real `https://` photo URL, check the skill you just added, save — confirm success and that a reload still shows the saved values.
4. `/coach/courses` — create a course using that skill, with a start time in the future — confirm it appears in the list with `尚未開始`. Edit it (change the name) — confirm the update is reflected.
5. `/coach/earnings` — confirm the chart renders and the month picker updates the detail panel.
6. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

- [ ] **Step 3: Report results**

No commit for this task (verification only). Report which of the 5 checks passed live vs. were only confirmed by code reading.

## Node process safety

Every task in this plan that starts a dev server must stop only the exact PID/job it started. Never run `taskkill /IM node.exe /F` or any blanket kill-all-Node command.

---

## Self-review notes

- **Spec coverage**: skill tag CRUD ✓ (Task 1), coach profile + skill selection ✓ (Task 2), course list/create/edit ✓ (Task 3), Recharts revenue chart ✓ (Task 4), full walkthrough ✓ (Task 5).
- **Not in this plan**: course deletion (no backend endpoint exists for it — not an oversight, a hard backend limitation), a committed Playwright E2E test suite (covered by the separate `docs/superpowers/plans/2026-09-12-r-fitness-e2e-tests.md` plan, which depends on this plan being merged first since its coach-side spec exercises these exact pages).
- **Type consistency check**: `CoachCourseListItem` (already in `types/api.ts`) is consumed by `CoursesView`'s list render — `status`, `participants`, `max_participants` all match. `CoachCourseDetail` (`skill_id`, `skill_name`, plus the same fields as the payload minus `skill_name`) is consumed by `startEdit`'s pre-fill — matches. `CoachCoursePayload` (`skill_id`, `name`, `description`, `start_at`, `end_at`, `max_participants`, `meeting_url`) is exactly what `handleSubmit` builds — matches both `postCoachCourse` and `putCoachCourse`'s parameter type. `CoachSelfUpdatePayload` (`skill_ids`, `experience_years`, `description`, `profile_image_url` — all required, `profile_image_url: string` not nullable) matches what `ProfileView`'s `handleSubmit` sends — matches. `RevenueResult`'s `total: { revenue, participants, course_count }` matches `EarningsView`'s per-month mapping — matches.
