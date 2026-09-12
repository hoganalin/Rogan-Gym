# R Fitness Member Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder content of the four `/user/*` pages (`DashboardView`, `ProfileView`, `OrdersView`, `BecomeCoachView`) with real data and interactions — viewing/cancelling bookings, editing profile/password, viewing purchase history, and applying to become a coach.

**Architecture:** Same conventions as the already-merged Public Pages plan: each page fetches its own data in `useEffect`, `sweetalert2` handles confirm/success/error feedback, `extractErrorMessage` surfaces real backend errors. Booking cancellation extends the existing `useCourseActions` hook (it already owns course-booking concerns) rather than creating a new hook. `AuthContext` needs a small extension first — it currently exposes `{ name, role }` for the logged-in user but not their own `id`, and the become-coach API call needs it.

**Tech Stack:** React 19, TypeScript, react-router-dom, sweetalert2, dayjs — all already installed. No new dependencies.

---

## Context for the engineer

- This continues on top of the already-merged Foundation and Public Pages plans (`docs/superpowers/plans/2026-09-11-r-fitness-frontend-foundation.md`, `docs/superpowers/plans/2026-09-11-r-fitness-public-pages.md`). Read the Public Pages plan's "Context for the engineer" section for the unwrap convention (`const { data } = await someApiCall()`) and the established page patterns — this plan follows them exactly.
- `frontend/src/pages/user/{DashboardView,ProfileView,OrdersView,BecomeCoachView}.tsx` currently render only a heading and one placeholder sentence. **Do not change their file paths, default-export names, or the routes in `frontend/src/App.tsx`.**
- The backend (`backend/`) must not be modified.
- **Known backend limitation, not a bug to "fix"**: a JWT's `role` claim is fixed at the moment it's issued (`backend/controllers/users.js`'s `login` signs `{ id, role }` into the token). When `BecomeCoachView`'s submission succeeds, the *database* row is updated to `role: "COACH"` immediately, but the browser's existing session cookie still holds the old token with `role: "USER"` baked in — there is no way to "hot-upgrade" the current session's role client-side. The correct, and only correct, UX is: show a success message, log the user out, and send them to `/login` so their next login issues a fresh token with the new role. Do not attempt to patch `AuthContext`'s in-memory `user.role` after a successful promotion — it would lie about what the actual session cookie's token contains.
- **Known backend limitation**: `GET /api/users/credit-package` (purchase history) returns objects with no `id` field — just `{ name?, purchased_credits, price_paid, purchase_at }`. `OrdersView` uses the array index as the React key; this is an accepted limitation given the API shape, not a code smell to fix here.
- A user can only ever have **one** booking record per course (the backend's `createBooking` checks for *any* existing booking, cancelled or not, and rejects a second one with `已經報名過此課程`) — so `course_id` is a safe, unique React key for the booking list in `DashboardView`.

---

## File Structure

```
frontend/src/
├── types/api.ts                        (modify — AuthUser gains `id`)
├── context/AuthContext.tsx             (modify — both user-construction sites set `id`)
├── hooks/useCourseActions.ts           (modify — add cancelBooking)
└── pages/user/
    ├── DashboardView.tsx               (modify — real course-booking list + cancel)
    ├── ProfileView.tsx                 (modify — edit name + change password)
    ├── OrdersView.tsx                  (modify — real purchase history)
    └── BecomeCoachView.tsx             (modify — real promote-to-coach form)
```

---

## Task 1: Expose the current user's id from AuthContext

**Files:**
- Modify: `frontend/src/types/api.ts`
- Modify: `frontend/src/context/AuthContext.tsx`

- [ ] **Step 1: Add `id` to the `AuthUser` type in `frontend/src/types/api.ts`**

Find this existing interface:

```ts
export interface AuthUser {
  name: string;
  role: Role;
}
```

Replace it with:

```ts
export interface AuthUser {
  id: string;
  name: string;
  role: Role;
}
```

- [ ] **Step 2: Set `id` at both construction sites in `frontend/src/context/AuthContext.tsx`**

There are exactly two places that build a `user` object — the mount-time session restore inside the `useEffect`, and the `login` function. Both currently look like this:

```ts
      .then(({ data }) => {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({ name: data.user.name, role: decoded.role });
      })
```

and:

```ts
  async function login(payload: LoginPayload) {
    const { data } = await postLogin(payload);
    const decoded = jwtDecode<DecodedToken>(data.token);
    setKeyFromCookie("token", data.token, decoded.exp);
    setUser({ name: data.user.name, role: decoded.role });
  }
```

`DecodedToken` already has `id: string` (it's the JWT's own `id` claim). Change both `setUser(...)` calls to include it:

```ts
        setUser({ id: decoded.id, name: data.user.name, role: decoded.role });
```

and:

```ts
    setUser({ id: decoded.id, name: data.user.name, role: decoded.role });
```

Do not change anything else in the file — same imports, same `loading`/`login`/`signup`/`logout` behavior.

- [ ] **Step 3: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/api.ts frontend/src/context/AuthContext.tsx
git commit -m "feat(frontend): expose the logged-in user's id from AuthContext"
```

Append this attribution trailer:
```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01L3VsfdL5LhFismuVCMfvLM
```

---

## Task 2: Dashboard with real bookings and cancellation

**Files:**
- Modify: `frontend/src/hooks/useCourseActions.ts` (add `cancelBooking`)
- Modify: `frontend/src/pages/user/DashboardView.tsx` (full replacement)

- [ ] **Step 1: Add `cancelBooking` to `frontend/src/hooks/useCourseActions.ts`**

The current file (from the Public Pages plan) is:

```ts
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking } from "../api/courses";
import { extractErrorMessage } from "../lib/errors";

export function useCourseActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function bookCourse(courseId: string, courseName: string) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load.
    if (loading) return;

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

Replace the whole file with this version, which adds `cancelBooking` (returns `boolean` so the caller knows whether to refetch its list) and imports `deleteCourseBooking`:

```ts
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postCourseBooking, deleteCourseBooking } from "../api/courses";
import { extractErrorMessage } from "../lib/errors";

export function useCourseActions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  async function bookCourse(courseId: string, courseName: string) {
    // AuthContext is still restoring the session from the cookie on mount —
    // treating this the same as "logged out" would spuriously redirect an
    // actually-authenticated user who clicks right after page load.
    if (loading) return;

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

  async function cancelBooking(courseId: string, courseName: string): Promise<boolean> {
    if (loading) return false;

    if (!user) {
      navigate("/login");
      return false;
    }

    const result = await Swal.fire({
      title: `確定要取消報名「${courseName}」嗎？`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "取消報名",
      cancelButtonText: "再想想",
      confirmButtonColor: "#e11d48",
    });
    if (!result.isConfirmed) return false;

    try {
      await deleteCourseBooking(courseId);
      await Swal.fire({ icon: "success", title: "已取消報名" });
      return true;
    } catch (err) {
      await Swal.fire({ icon: "error", title: "取消失敗", text: extractErrorMessage(err) });
      return false;
    }
  }

  return { bookCourse, cancelBooking };
}
```

- [ ] **Step 2: Replace `frontend/src/pages/user/DashboardView.tsx`**

```tsx
import { useEffect, useState } from "react";
import { getUserCourses } from "../../api/users";
import { useCourseActions } from "../../hooks/useCourseActions";
import { formatCourseTime } from "../../lib/formatDateTime";
import type { UserCoursesResult } from "../../types/api";

export default function DashboardView() {
  const { cancelBooking } = useCourseActions();
  const [dashboard, setDashboard] = useState<UserCoursesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUserCourses();
      setDashboard(data);
    } catch {
      setError("載入課表失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCancel(courseId: string, courseName: string) {
    const cancelled = await cancelBooking(courseId, courseName);
    if (cancelled) {
      loadDashboard();
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-rose-600">{error}</p>;
  if (!dashboard) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold">我的課表</h1>
      <div className="mt-4 flex gap-6 text-sm text-slate-600">
        <p>
          剩餘堂數：<span className="font-semibold text-brand-600">{dashboard.credit_remain}</span>
        </p>
        <p>已使用：{dashboard.credit_usage} 堂</p>
      </div>

      {dashboard.course_booking.length === 0 && (
        <p className="mt-6 text-slate-500">目前沒有報名的課程。</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {dashboard.course_booking.map((booking) => (
          <div key={booking.course_id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{booking.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCourseTime(booking.start_at, booking.end_at)}・{booking.coach_name}
                </p>
                {booking.cancelled_at && (
                  <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                    已取消
                  </span>
                )}
              </div>
              {!booking.cancelled_at && (
                <button
                  type="button"
                  onClick={() => handleCancel(booking.course_id, booking.name)}
                  className="shrink-0 rounded border border-rose-300 px-4 py-2 text-sm text-rose-600"
                >
                  取消報名
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
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

Using a test user (sign up fresh or reuse one from earlier plans' verification work that still has purchased credits — check `curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:8080/api/users/credit-package`), book at least one course if they don't already have an active booking (via the UI's `/coaches/:id` page, or `curl -X POST http://127.0.0.1:8080/api/courses/<courseId> -H "Authorization: Bearer <TOKEN>"`).

Start the dev server on a scratch port and, using Playwright (`@playwright/test` is installed; `npx playwright install chromium` if needed) via a throwaway script (delete when done, don't commit):
1. Log in as that user, navigate to `/user/dashboard` — confirm `credit_remain`/`credit_usage` render and the booked course appears with a "取消報名" button.
2. Click "取消報名" — confirm the SweetAlert warning-confirm dialog appears, confirm it, confirm a success alert, and confirm the list re-renders showing "已取消" on that booking with the button gone.
3. Clean up: close the browser, stop only the exact PID you started (verify via `netstat`/`tasklist`), delete the throwaway script, confirm `git status --short` is clean.

**Never use a blanket `taskkill /IM node.exe /F`** — this has caused collateral damage on this machine before. Target exact PIDs only.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useCourseActions.ts frontend/src/pages/user/DashboardView.tsx
git commit -m "feat(frontend): wire DashboardView to real bookings with cancellation"
```

Append the attribution trailer (same as Task 1).

---

## Task 3: Profile page — edit name and change password

**Files:**
- Modify: `frontend/src/pages/user/ProfileView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/user/ProfileView.tsx`**

```tsx
import { useEffect, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { getUserProfile, putUserProfile, putUserPassword } from "../../api/users";
import { extractErrorMessage } from "../../lib/errors";

export default function ProfileView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    let cancelled = false;
    getUserProfile()
      .then(({ data }) => {
        if (cancelled) return;
        setName(data.user.name);
        setEmail(data.user.email);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleNameSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const { data } = await putUserProfile({ name });
      setName(data.user.name);
      await Swal.fire({ icon: "success", title: "暱稱已更新" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "更新失敗", text: extractErrorMessage(err) });
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await putUserPassword({
        password,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      await Swal.fire({ icon: "success", title: "密碼已更新" });
    } catch (err) {
      await Swal.fire({ icon: "error", title: "更新失敗", text: extractErrorMessage(err) });
    }
  }

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">會員資料</h1>

      <form onSubmit={handleNameSubmit} className="mt-6 max-w-sm">
        <h2 className="font-semibold">基本資料</h2>
        <label className="mt-3 block text-sm text-slate-500">
          Email
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-400"
          />
        </label>
        <label className="mt-3 block text-sm">
          暱稱
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white">
          儲存暱稱
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-10 max-w-sm">
        <h2 className="font-semibold">修改密碼</h2>
        <label className="mt-3 block text-sm">
          目前密碼
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          新密碼
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-3 block text-sm">
          確認新密碼
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white">
          更新密碼
        </button>
      </form>
    </div>
  );
}
```

Note: this page does not update `AuthContext`'s `user.name` after a successful name change, so the nav bar's "登出（<name>）" text won't reflect the new name until the next login. This is an accepted, deliberate limitation at this scope (not a bug) — `AuthContext` was not designed with a live-update setter, and adding one just for this cosmetic sync is not worth the complexity here.

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using a dedicated throwaway test user (password changes are hard to undo — don't use an account you need to keep working with afterward), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/user/profile` — confirm the real email (disabled field) and name render.
2. Change the name, submit — confirm a success alert, confirm the input now shows the updated name.
3. Submit the password form with a wrong "目前密碼" — confirm an error alert appears with the real backend message (`密碼輸入錯誤`).
4. Submit the password form with correct current password and matching new/confirm values — confirm a success alert. Then log out and log back in with the *new* password to independently confirm it actually took effect server-side (don't just trust the success alert).
5. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

**Never use a blanket `taskkill /IM node.exe /F`.**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/user/ProfileView.tsx
git commit -m "feat(frontend): wire ProfileView to real profile and password updates"
```

Append the attribution trailer.

---

## Task 4: Purchase history

**Files:**
- Modify: `frontend/src/pages/user/OrdersView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/user/OrdersView.tsx`**

```tsx
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getUserCreditPackage } from "../../api/users";
import type { CreditPurchase } from "../../types/api";

export default function OrdersView() {
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUserCreditPackage()
      .then(({ data }) => {
        if (!cancelled) setPurchases(data);
      })
      .catch(() => {
        if (!cancelled) setError("載入購買紀錄失敗，請稍後再試。");
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
      <h1 className="text-2xl font-bold">購買紀錄</h1>

      {loading && <p className="mt-6 text-slate-500">載入中…</p>}
      {error && <p className="mt-6 text-rose-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 flex flex-col gap-3">
          {purchases.map((purchase, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <h3 className="font-semibold">{purchase.name ?? "已下架方案"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {dayjs(purchase.purchase_at).format("YYYY/M/D HH:mm")}・{purchase.purchased_credits} 堂
                </p>
              </div>
              <p className="font-semibold text-brand-600">${purchase.price_paid}</p>
            </div>
          ))}
          {purchases.length === 0 && <p className="text-slate-500">目前沒有購買紀錄。</p>}
        </div>
      )}
    </div>
  );
}
```

The array index is used as the React key here deliberately — see this plan's "Context for the engineer" note on why `CreditPurchase` has no stable id.

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using a test user who has purchased at least one credit package (from this or an earlier plan's verification work — check `curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:8080/api/users/credit-package`; if empty, purchase one via the `/fitness-plans` UI first), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Log in, navigate to `/user/orders` — confirm at least one purchase renders with a package name (or "已下架方案" if the package was since deleted), date, credit count, and price.
2. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/user/OrdersView.tsx
git commit -m "feat(frontend): wire OrdersView to real purchase history"
```

Append the attribution trailer.

---

## Task 5: Become-coach form

**Files:**
- Modify: `frontend/src/pages/user/BecomeCoachView.tsx` (full replacement)

- [ ] **Step 1: Replace `frontend/src/pages/user/BecomeCoachView.tsx`**

```tsx
import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { postPromoteUserToCoach } from "../../api/coach";
import { extractErrorMessage } from "../../lib/errors";

export default function BecomeCoachView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [experienceYears, setExperienceYears] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      await postPromoteUserToCoach(user.id, {
        experience_years: Number(experienceYears),
        description,
        ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
      });
      await Swal.fire({
        icon: "success",
        title: "升級成功！",
        text: "請重新登入以啟用教練功能。",
      });
      logout();
      navigate("/login");
    } catch (err) {
      await Swal.fire({ icon: "error", title: "升級失敗", text: extractErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">成為教練</h1>
      <p className="mt-2 text-slate-600">填寫經歷與自我介紹，升級為 R Fitness 教練。</p>

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
          個人照片網址（選填，需以 https 開頭）
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            placeholder="https://"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          送出申請
        </button>
      </form>
    </div>
  );
}
```

This depends on Task 1's `user.id` — if `npx tsc -b` fails with a missing-property error on `user.id`, Task 1 wasn't applied correctly; stop and check rather than working around it (e.g. don't decode the JWT again here — `AuthContext` is the single source of truth for the current user).

- [ ] **Step 2: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors.

- [ ] **Step 3: Manual verification**

Using a **fresh, dedicated test user** (this action is irreversible for this plan's purposes — a promoted user can't be un-promoted through the UI, and you'll need this exact account for Task 6's E2E walkthrough), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):
1. Sign up a fresh user, log in, navigate to `/user/become-coach`.
2. Fill in the form (e.g. experience years `3`, a description, leave the photo URL blank) and submit — confirm a success alert with the "請重新登入" message.
3. Confirm the app navigated to `/login` after the alert closes.
4. Confirm the session was actually cleared (e.g. check the `token` cookie is gone, or that navigating to `/user/dashboard` now redirects to `/login` instead of showing the dashboard).
5. Log back in with the same account — confirm the nav bar now shows "教練後台" instead of "我的課表" (proving the fresh login issued a token with the updated `COACH` role).
6. Clean up: close the browser, stop only the exact PID you started, delete the throwaway script, confirm `git status --short` is clean.

**Keep this test account's credentials** (email/password) — Task 6 reuses it.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/user/BecomeCoachView.tsx
git commit -m "feat(frontend): wire BecomeCoachView to real promote-to-coach flow"
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

- [ ] **Step 2: Walk the full member-area journey against the real backend**

Using a fresh test user (not the one promoted to coach in Task 5 — that account is now a `COACH` and `/user/*` would reject it; sign up a brand new one), start the dev server on a scratch port and, via a throwaway Playwright script (delete when done):

1. Sign up, log in, buy a credit package from `/fitness-plans`, then book a course from `/coaches/<id>` or `/`.
2. Visit `/user/dashboard` — confirm `credit_remain`/`credit_usage` reflect the purchase and booking, and the booked course appears with a "取消報名" button.
3. Cancel that booking — confirm the list updates to show "已取消" and the credit count changes accordingly on a reload of the dashboard.
4. Visit `/user/orders` — confirm the earlier purchase appears.
5. Visit `/user/profile` — change the display name, confirm success, confirm the input reflects the new name.
6. Log out, then log back in as the account promoted to `COACH` in Task 5 — confirm the nav bar shows "教練後台" and that visiting `/user/dashboard` now redirects to `/` (since a `COACH` doesn't have `USER`-role access under the current route guards), proving the role change from Task 5 persisted correctly across a real login.

- [ ] **Step 3: Report results**

No commit for this task (verification only). Report which of the 6 checks passed live vs. were only confirmed by code reading.

## Node process safety

Every task in this plan that starts a dev server must stop only the exact PID/job it started. Never run `taskkill /IM node.exe /F` or any blanket kill-all-Node command.

---

## Self-review notes

- **Spec coverage**: AuthContext id exposure ✓ (Task 1), DashboardView with cancellation ✓ (Task 2), ProfileView with name/password editing ✓ (Task 3), OrdersView ✓ (Task 4), BecomeCoachView with the forced-relogin flow ✓ (Task 5), full E2E walkthrough ✓ (Task 6).
- **Not in this plan** (deferred to a future, unwritten plan): the coach area (`/coach/*` — course management CRUD, the Recharts revenue chart, skill tag management), and the Playwright E2E test suite itself as committed, versioned test code (this plan's manual verification steps are throwaway scripts, same convention as the Public Pages plan).
- **Type consistency check**: `AuthUser.id` (Task 1) is consumed by `BecomeCoachView.tsx` (Task 5) as `user.id` — matches. `useCourseActions`'s new `cancelBooking` return type (`Promise<boolean>`, Task 2) is consumed by `DashboardView.tsx`'s `handleCancel` (`if (cancelled) { loadDashboard(); }`) — matches. `deleteCourseBooking` (Task 2) is imported from `../api/courses`, already exported there since the Foundation plan — no redefinition. `UserCoursesResult`, `CreditPurchase`, `PromoteCoachPayload`-shaped inline object, `UserProfile` are all imported from the existing `types/api.ts`, none redefined.
