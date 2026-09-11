# R Fitness Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder content of the four public-facing pages (`HomeView`, `CoachesView`, `CoachDetail`, `FitnessPlans`) with real data fetched from the backend, and wire up the two public interactions available to any logged-in member — booking a course and buying a credit package — using `sweetalert2` for confirm/success/error feedback.

**Architecture:** Each page fetches its own data in a `useEffect` (no shared data-fetching abstraction — four independent pages, not worth a generic hook at this size). Two small custom hooks (`useCourseActions`, `usePackageActions`) centralize the "confirm via SweetAlert → call the API → show success/error" pattern, since booking appears on both `HomeView` and `CoachDetail`. A shared `extractErrorMessage` helper surfaces the backend's exact error strings (e.g. the four fixed M5 messages) in the SweetAlert error dialog instead of a generic fallback.

**Tech Stack:** React 19, TypeScript, react-router-dom, sweetalert2, dayjs — all already installed from the Foundation plan. No new dependencies.

---

## Context for the engineer

- This continues directly on top of the already-merged "R Fitness Frontend Foundation" plan (`docs/superpowers/plans/2026-09-11-r-fitness-frontend-foundation.md`). Read its "Context for the engineer" section if you need background on the auth/routing setup — you don't need to re-derive any of those decisions.
- `frontend/src/pages/public/{HomeView,CoachesView,CoachDetail,FitnessPlans}.tsx` currently render only a heading and one placeholder sentence. This plan replaces their bodies. **Do not change their file paths, their default-export names, or the routes in `frontend/src/App.tsx`** — the router already points at these files correctly.
- `frontend/src/pages/public/auth/{LoginView,SignupView}.tsx` are **already fully functional** (call `AuthContext.login`/`signup` for real) — nothing to do there.
- The backend (`backend/`) must not be modified. All API shapes below already exist in `frontend/src/api/*.ts` and `frontend/src/types/api.ts` from the Foundation plan — import from them, don't redefine types.
- **Known backend limitation, not a bug to "fix"**: `GET /api/coaches` (the coach list) returns only `{ id, user_id, name }` per coach — no profile photo. `CoachesView` and the "熱門教練" section on `HomeView` render an initials-circle avatar (first character of the name) instead of a photo. This is deliberate.
- **Known backend limitation**: `GET /api/coaches` has no total-count field, so `CoachesView`'s pagination can't show "page 3 of 7" — it uses a simple "上一頁 / 下一頁" pattern, disabling "下一頁" when a page returns fewer than the requested `per` count (a reasonable heuristic that it's the last page).
- Every API response is unwrapped to `{ status: "success", data }` by the Foundation plan's axios interceptor, and the typed API functions (e.g. `getCoaches`) resolve directly to that `{ status, data }` object — so `const { data } = await getCoaches(6, 1)` gives you the array directly. This is the same pattern already used in `AuthContext.tsx` (`const { data } = await postLogin(payload)`); follow it exactly, don't add an extra `.data.data`.

---

## File Structure

```
frontend/src/
├── lib/
│   ├── errors.ts               (new — extractErrorMessage)
│   └── formatDateTime.ts       (new — formatCourseTime)
├── hooks/
│   ├── useCourseActions.ts     (new — bookCourse, used by CoachDetail + HomeView)
│   └── usePackageActions.ts    (new — buyPackage, used by FitnessPlans)
└── pages/public/
    ├── CoachesView.tsx         (modify — real paginated coach list)
    ├── CoachDetail.tsx         (modify — real profile + courses + booking)
    ├── HomeView.tsx            (modify — hero + upcoming courses + featured coaches)
    └── FitnessPlans.tsx        (modify — real credit packages + purchase)
```

---

## Task 1: Shared error and date-formatting helpers

**Files:**
- Create: `frontend/src/lib/errors.ts`
- Create: `frontend/src/lib/formatDateTime.ts`

- [ ] **Step 1: Write `frontend/src/lib/errors.ts`**

```ts
import { isAxiosError } from "axios";
import type { ApiErrorBody } from "../types/api";

export function extractErrorMessage(error: unknown, fallback = "發生錯誤，請稍後再試"): string {
  if (isAxiosError<ApiErrorBody>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return fallback;
}
```

This surfaces the backend's real error text (e.g. `已經報名過此課程`, `已無可使用堂數`, `已達最大參加人數，無法參加`, `請先登入` — the four fixed M5 strings — plus any other `appError` message) directly in the UI instead of a generic message, whenever the backend actually returns one.

- [ ] **Step 2: Write `frontend/src/lib/formatDateTime.ts`**

```ts
import dayjs from "dayjs";

export function formatCourseTime(startAt: string, endAt: string): string {
  const start = dayjs(startAt);
  const end = dayjs(endAt);
  return `${start.format("YYYY/M/D HH:mm")} - ${end.format("HH:mm")}`;
}
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors (these are standalone pure functions with no dependents yet).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/errors.ts frontend/src/lib/formatDateTime.ts
git commit -m "feat(frontend): add error-message and date-formatting helpers"
```

Append this attribution trailer:
```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3VsfdL5LhFismuVCMfvLM
```

---

## Task 2: Real coach directory on `CoachesView`

**Files:**
- Modify: `frontend/src/pages/public/CoachesView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/public/CoachesView.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCoaches } from "../../api/coachesPublic";
import type { CoachListItem } from "../../types/api";

const PER_PAGE = 6;

export default function CoachesView() {
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCoaches(PER_PAGE, page)
      .then(({ data }) => {
        if (!cancelled) setCoaches(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入教練列表失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold">教練列表</h1>
      <p className="mt-2 text-slate-600">瀏覽 R Fitness 所有教練，尋找適合你的訓練夥伴。</p>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {coaches.map((coach) => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-400"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display font-bold text-brand-700">
                  {coach.name.charAt(0)}
                </span>
                <span className="font-medium">{coach.name}</span>
              </Link>
            ))}
          </div>

          {coaches.length === 0 && <p className="mt-6 text-slate-500">目前沒有教練資料。</p>}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              上一頁
            </button>
            <span className="text-sm text-slate-500">第 {page} 頁</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={coaches.length < PER_PAGE}
              className="rounded border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              下一頁
            </button>
          </div>
        </>
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

Seed at least one coach so the list isn't empty. If none exist yet, sign up a user via the app, then promote them via curl (replace `<TOKEN>` with a real login token and `<USER_ID>` with that user's id — both obtainable from a signup+login curl round trip, or from a browser DevTools Network tab after logging in):

```bash
curl -X POST http://127.0.0.1:8080/api/admin/coaches/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"experience_years": 3, "description": "熱愛重量訓練與體態雕塑", "profile_image_url": "https://example.com/a.png"}'
```

Then start the dev server (`npm run dev -- --port <scratch-port>`), visit `/coaches`, confirm the seeded coach appears with an initials avatar, and confirm "上一頁" is disabled on page 1. Stop only the exact PID you started — never a blanket `taskkill /IM node.exe /F`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/public/CoachesView.tsx
git commit -m "feat(frontend): wire CoachesView to real paginated coach data"
```

Append the attribution trailer (same as Task 1).

---

## Task 3: Coach detail page with booking

**Files:**
- Create: `frontend/src/hooks/useCourseActions.ts`
- Modify: `frontend/src/pages/public/CoachDetail.tsx` (full replacement)

- [ ] **Step 1: Write `frontend/src/hooks/useCourseActions.ts`**

```ts
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking } from "../api/courses";
import { extractErrorMessage } from "../lib/errors";

export function useCourseActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function bookCourse(courseId: string, courseName: string) {
    if (!user) {
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: `確定要報名「${courseName}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "報名",
      cancelButtonText: "取消",
      confirmButtonColor: "#d93c10",
    });
    if (!result.isConfirmed) return;

    try {
      await postCourseBooking(courseId);
      await Swal.fire({ icon: "success", title: "報名成功" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "報名失敗", text: extractErrorMessage(err) });
    }
  }

  return { bookCourse };
}
```

- [ ] **Step 2: Replace `frontend/src/pages/public/CoachDetail.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCoachDetail, getCoachCourses } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { CoachDetail as CoachDetailData, PublicCourse } from "../../types/api";

export default function CoachDetail() {
  const { coachId } = useParams<{ coachId: string }>();
  const { bookCourse } = useCourseActions();
  const [detail, setDetail] = useState<CoachDetailData | null>(null);
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getCoachDetail(coachId), getCoachCourses(coachId)])
      .then(([detailRes, coursesRes]) => {
        if (cancelled) return;
        setDetail(detailRes.data);
        setCourses(coursesRes.data);
      })
      .catch(() => {
        if (!cancelled) setError("載入教練資料失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coachId]);

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!detail) return null;

  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display text-2xl font-bold text-brand-700">
          {detail.user.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{detail.user.name}</h1>
          <p className="text-sm text-slate-500">{detail.coach.experience_years} 年教學經驗</p>
        </div>
      </div>

      <p className="mt-4 text-slate-700">{detail.coach.description}</p>

      {detail.coach.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {detail.coach.skills.map((skill) => (
            <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {skill}
            </span>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-xl font-bold">開設課程</h2>
      {courses.length === 0 && <p className="mt-2 text-slate-500">目前沒有開放報名的課程。</p>}
      <div className="mt-4 flex flex-col gap-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(course.start_at, course.end_at)}・{course.skill_name}
                </p>
                <p className="mt-2 text-sm text-slate-600">{course.description}</p>
              </div>
              <button
                type="button"
                onClick={() => bookCourse(course.id, course.name)}
                className="shrink-0 rounded bg-brand-600 px-4 py-2 text-sm text-white"
              >
                報名
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Note: the type import is renamed to `CoachDetailData` because the page component itself is also named `CoachDetail` (default export) — importing the type as `CoachDetail` would collide with the component name.

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 4: Manual verification**

Using the coach seeded in Task 2, add a course for them (needs that coach's own login token — log in as the promoted user, then use their token):

```bash
curl -X POST http://127.0.0.1:8080/api/admin/coaches/courses \
  -H "Authorization: Bearer <COACH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "<SKILL_ID>", "name": "重量訓練基礎班", "description": "適合新手的重訓入門課程", "start_at": "2026-12-01T10:00:00.000Z", "end_at": "2026-12-01T11:00:00.000Z", "max_participants": 10, "meeting_url": "https://example.com/meet"}'
```

(Get a `<SKILL_ID>` via `curl http://127.0.0.1:8080/api/coaches/skill`; if empty, seed one with `curl -X POST http://127.0.0.1:8080/api/coaches/skill -H "Content-Type: application/json" -d '{"name": "重量訓練"}'`.)

Start the dev server on a scratch port, visit `/coaches/<coachId>`, confirm the profile, skills, and course render, and confirm clicking "報名" while logged out redirects to `/login`. Log in as a different (non-coach) user and confirm clicking "報名" shows a SweetAlert confirm dialog, then a success alert. Stop only the exact PID you started.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useCourseActions.ts frontend/src/pages/public/CoachDetail.tsx
git commit -m "feat(frontend): wire CoachDetail to real data with course booking"
```

Append the attribution trailer.

---

## Task 4: Home page with upcoming courses and featured coaches

**Files:**
- Modify: `frontend/src/pages/public/HomeView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/public/HomeView.tsx`**

```tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../api/courses";
import { getCoaches } from "../../api/coachesPublic";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { CoachListItem, PublicCourse } from "../../types/api";

export default function HomeView() {
  const { bookCourse } = useCourseActions();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [coaches, setCoaches] = useState<CoachListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCourses(), getCoaches(3, 1)])
      .then(([coursesRes, coachesRes]) => {
        if (cancelled) return;
        setCourses(coursesRes.data.slice(0, 6));
        setCoaches(coachesRes.data);
      })
      .catch((err) => {
        console.error("Failed to load home page data", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold">R Fitness</h1>
        <p className="mt-3 text-lg text-slate-600">找到你的教練，安排屬於你的訓練課表。</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/coaches" className="rounded bg-brand-600 px-5 py-2 text-white">
            瀏覽教練
          </Link>
          <Link to="/fitness-plans" className="rounded border border-brand-600 px-5 py-2 text-brand-600">
            查看方案
          </Link>
        </div>
      </section>

      {!loading && courses.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">近期課程</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold">{course.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(course.start_at, course.end_at)}・{course.coach_name}
                </p>
                <button
                  type="button"
                  onClick={() => bookCourse(course.id, course.name)}
                  className="mt-3 rounded bg-brand-600 px-4 py-1.5 text-sm text-white"
                >
                  報名
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && coaches.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">熱門教練</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {coaches.map((coach) => (
              <Link
                key={coach.id}
                to={`/coaches/${coach.id}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-400"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-display font-bold text-brand-700">
                  {coach.name.charAt(0)}
                </span>
                <span className="font-medium">{coach.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

`HomeView` deliberately degrades gracefully on fetch failure (logs to console, leaves both sections empty, hero still renders) rather than showing an error banner — it's a landing page, not a data-critical view.

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

With the coach/course/skill data seeded in Tasks 2-3 still in the database, start the dev server on a scratch port, visit `/`, confirm "近期課程" shows the seeded course and "熱門教練" shows the seeded coach, and confirm clicking "報名" on the home page course card behaves identically to Task 3's booking flow (shared hook). Stop only the exact PID you started.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/public/HomeView.tsx
git commit -m "feat(frontend): wire HomeView to real upcoming courses and featured coaches"
```

Append the attribution trailer.

---

## Task 5: Fitness plans page with purchase

**Files:**
- Create: `frontend/src/hooks/usePackageActions.ts`
- Modify: `frontend/src/pages/public/FitnessPlans.tsx` (full replacement)

- [ ] **Step 1: Write `frontend/src/hooks/usePackageActions.ts`**

```ts
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCreditPackage } from "../api/creditPackage";
import { extractErrorMessage } from "../lib/errors";

export function usePackageActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function buyPackage(packageId: string, packageName: string) {
    if (!user) {
      navigate("/login");
      return;
    }

    const result = await Swal.fire({
      title: `確定要購買「${packageName}」嗎？`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "購買",
      cancelButtonText: "取消",
      confirmButtonColor: "#d93c10",
    });
    if (!result.isConfirmed) return;

    try {
      await postCreditPackage(packageId);
      await Swal.fire({ icon: "success", title: "購買成功" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "購買失敗", text: extractErrorMessage(err) });
    }
  }

  return { buyPackage };
}
```

- [ ] **Step 2: Replace `frontend/src/pages/public/FitnessPlans.tsx`**

```tsx
import { useEffect, useState } from "react";
import { getCreditPackages } from "../../api/creditPackage";
import { usePackageActions } from "../../hooks/usePackageActions";
import type { CreditPackage } from "../../types/api";

export default function FitnessPlans() {
  const { buyPackage } = usePackageActions();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCreditPackages()
      .then(({ data }) => {
        if (!cancelled) setPackages(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入方案失敗，請稍後再試。");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">健身方案</h1>
      <p className="mt-2 text-slate-600">購買堂數方案，開始報名課程。</p>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">{pkg.name}</h3>
              <p className="mt-2 text-3xl font-bold text-brand-600">${pkg.price}</p>
              <p className="mt-1 text-sm text-slate-500">{pkg.credit_amount} 堂</p>
              <button
                type="button"
                onClick={() => buyPackage(pkg.id, pkg.name)}
                className="mt-4 rounded bg-brand-600 py-2 text-sm text-white"
              >
                購買
              </button>
            </div>
          ))}
          {packages.length === 0 && <p className="text-slate-500">目前沒有可購買的方案。</p>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 4: Manual verification**

Seed a credit package (no auth required for this GET/POST per the backend's current, unmodified rules):

```bash
curl -X POST http://127.0.0.1:8080/api/credit-package \
  -H "Content-Type: application/json" \
  -d '{"name": "10堂體驗包", "price": 3000, "credit_amount": 10}'
```

Start the dev server on a scratch port, visit `/fitness-plans`, confirm the package renders, confirm clicking "購買" while logged out redirects to `/login`, and confirm it succeeds when logged in. Stop only the exact PID you started.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/usePackageActions.ts frontend/src/pages/public/FitnessPlans.tsx
git commit -m "feat(frontend): wire FitnessPlans to real credit packages with purchase"
```

Append the attribution trailer.

---

## Task 6: Full end-to-end walkthrough

**Files:** none (verification only)

- [ ] **Step 1: Type-check and build the whole frontend**

```bash
cd frontend && npx tsc -b && npm run build
```

Expected: zero errors, `dist/` produced.

- [ ] **Step 2: Walk the full public journey against the real backend**

With the backend running and the coach/course/skill/package data seeded across Tasks 2-5 still present, start the dev server on a scratch port and, in a browser (or via a throwaway Playwright script, cleaned up afterward, same approach used in the Foundation plan's Task 5 review):

1. Visit `/` — confirm hero, "近期課程" (with the seeded course), and "熱門教練" (with the seeded coach) all render.
2. Click through to `/coaches` — confirm the seeded coach appears; click into `/coaches/<id>` — confirm profile, skills, and course render.
3. While logged out, click "報名" on the coach detail page — confirm redirect to `/login`.
4. Sign up a fresh test user, log in, click "報名" again — confirm the SweetAlert confirm dialog appears, confirm it, and confirm a success alert shows.
5. Visit `/fitness-plans` — confirm the seeded package renders; click "購買" — confirm the same confirm/success flow.
6. Try booking the same course a second time as the same user — confirm the error alert shows the exact backend message `已經報名過此課程` (proving `extractErrorMessage` correctly surfaces real backend errors, not just the generic fallback).

- [ ] **Step 3: Report results**

No commit for this task (verification only). Report which of the 6 checks passed live vs. were only confirmed by code reading, following the same reporting discipline used in the Foundation plan.

## Node process safety

Every task in this plan that starts a dev server must stop only the exact PID/job it started. Never run `taskkill /IM node.exe /F` or any blanket kill-all-Node command — this has caused collateral damage (killing unrelated tools) during the Foundation plan's execution.

---

## Self-review notes

- **Spec coverage**: HomeView ✓ (Task 4), CoachesView ✓ (Task 2), CoachDetail ✓ (Task 3), FitnessPlans ✓ (Task 5), booking interaction ✓ (Task 3's hook, reused in Task 4), purchase interaction ✓ (Task 5's hook), sweetalert2 confirm/success/error ✓ (both hooks), unauthenticated → `/login` redirect ✓ (both hooks), Login/Signup correctly left untouched (already real from the Foundation plan).
- **Not in this plan** (deferred to later, unwritten plans): the member area (`/user/*` — viewing "我的課表", cancelling a booking, profile edit), the coach area (`/coach/*` — course management, revenue chart, skill tag management, become-a-coach form), and the Playwright E2E test suite itself (this plan's Task 6 verification is manual/throwaway, not committed test code).
- **Type consistency check**: `CoachListItem`, `CoachDetail`, `PublicCourse`, `CreditPackage` are all imported from `frontend/src/types/api.ts` (already defined in the Foundation plan) with no redefinition; `getCoaches`, `getCoachDetail`, `getCoachCourses`, `getCourses`, `getCreditPackages`, `postCourseBooking`, `postCreditPackage` are all imported from the existing `frontend/src/api/*.ts` modules with no redefinition. The `CoachDetail` type-vs-component-name collision in Task 3 is resolved via an import alias (`CoachDetail as CoachDetailData`), consistent across the file.
