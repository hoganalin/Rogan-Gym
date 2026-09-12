# R Fitness Playwright E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Commit the first real, versioned Playwright E2E test suite for the frontend — until now, every plan's "manual verification" step used a throwaway script that was deleted before commit; nothing has ever been committed as `frontend/playwright.config.ts` or `*.spec.ts`. `docs/adr/0001-react-rewrite-for-portfolio.md` scoped this to one member-side journey (login → browse coaches → book a course → view schedule); this plan expands that to also cover the coach-side journey (skills → profile → course create/edit → earnings), by explicit user request — this is scope beyond what the ADR originally committed to, noted here rather than silently assumed.

**Architecture:** Real backend, real Postgres, no mocking — same "test against the real thing" convention every prior plan's manual verification used. Because the dev database already has a lot of unpredictable leftover data from previous manual-verification sessions (dozens of credit packages, courses, skills), each spec seeds its **own** coach/skill/course/credit-package fixtures directly via the backend's HTTP API in a `test.beforeAll` (using plain `fetch`, not the UI) so the actual UI-driven assertions target data that's guaranteed to exist and is uniquely named (timestamped), regardless of whatever else is sitting in the database.

**Tech Stack:** `@playwright/test` (already a `devDependency`, `^1.49.1`) and the `test:e2e` npm script (already in `package.json`) — both currently unused; this plan is the first thing to actually use them. No new dependencies.

---

## Context for the engineer

- **Depends on the Coach Area plan being merged first** (`docs/superpowers/plans/2026-09-12-r-fitness-coach-area.md`) — the coach-side spec (Task 4 below) exercises `/coach/skills`, `/coach/profile`, and `/coach/courses`, which are placeholder pages until that plan lands. Confirm those pages are real (not 8-line stubs) before starting Task 4.
- **The backend and Postgres must already be running** before `npm run test:e2e` — Playwright's `webServer` config (Task 1) only auto-starts the **frontend** dev server; it does not start `backend/` or the `postgres` Docker container. Follow the README's "本機啟動" steps first (`docker compose up -d` for Postgres, `cd backend && npm run dev`) exactly like every prior plan's manual-verification steps required.
- **Card locator pattern**: every product/course "card" in this codebase (`FitnessPlans.tsx`, `HomeView.tsx`, `CoachDetail.tsx`) is a `<div>` whose direct children are an `<h3>{name}</h3>` heading and, as a sibling, the action `<button>`. So `page.getByRole("heading", { name: exactName }).locator("xpath=..")` reliably selects "the card containing this exact heading text" — use this pattern instead of guessing at CSS classes or hoping `page.getByRole("button", { name: "購買" })` resolves to the right one among dozens of identical buttons on the page.
- **SweetAlert2 dialogs**: every confirm/success/error dialog in this app is a `sweetalert2` modal. Its confirm button always has the CSS class `.swal2-confirm` and its title has class `.swal2-title` — target those classes directly (`page.locator(".swal2-confirm").click()`) rather than `getByRole("button", { name: ... })`, because the dialog's confirm button frequently has the **same visible text** as the page button that opened it (e.g. both say "報名"), which would otherwise be ambiguous.
- **Booking reliably**: the home page's "近期課程" section only shows the soonest-starting 6 courses site-wide (`getCourses()` is ordered by `start_at` ascending, sliced to 6 in `HomeView.tsx`), and this dev database already has many older/other courses that would sort ahead of a freshly-created fixture course — relying on the home page to show your fixture course is flaky. Instead, book via that specific fixture coach's own public detail page (`/coaches/:coachId`), whose course list (`GET /api/coaches/:coachId/courses`) is scoped to only that one coach's own future courses with **no truncation** — a brand-new fixture coach will have exactly one course there, unambiguous. The promote-to-coach endpoint's response already returns the new `Coach` row's `id` (`data.coach.id`) — capture it in the fixture helper and use it to build this URL, don't look it up separately.
- **Course times**: the backend requires UTC ISO 8601 `start_at`/`end_at` (see the Coach Area plan's "Context for the engineer" section for the exact regex). When seeding a course via the API helper (not through the UI), just use `new Date(...).toISOString()` directly — no `datetime-local` string-parsing dance is needed since this bypasses the UI form entirely.
- **Test users must have unique emails.** The backend rejects a duplicate email with 409 `Email已被註冊`. Every fixture/test user email must be timestamped/randomized (a shared `uniqueEmail()` helper is used everywhere) so re-running the suite never collides with a previous run's leftover data.
- **Password rule**: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/` — letters (upper+lower) and digits only, 8–16 characters, no special characters. Every fixture/test password in this plan uses `Password1234`.
- **Commit convention**: `test(e2e): ...` messages, one task = one commit, with the attribution trailer.

---

## File Structure

```
frontend/
├── playwright.config.ts       (create)
└── e2e/
    ├── api-helpers.ts         (create — fixture seeding via the real backend API)
    ├── member-journey.spec.ts (create — the ADR-promised member path, plus a credit purchase step)
    └── coach-journey.spec.ts  (create — skills, profile, course create/edit, earnings)
```

---

## Task 1: Playwright config and API fixture helpers

**Files:**
- Create: `frontend/playwright.config.ts`
- Create: `frontend/e2e/api-helpers.ts`

- [ ] **Step 1: Create `frontend/playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5175",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 5175 --strictPort",
    url: "http://127.0.0.1:5175",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
```

This only starts the frontend (Vite) dev server. The backend and Postgres must already be running on `127.0.0.1:8080` (matching `frontend/.env`'s `VITE_API_BASE_URL`) — see this plan's "Context for the engineer" note.

- [ ] **Step 2: Create `frontend/e2e/api-helpers.ts`**

```ts
const API_BASE = "http://127.0.0.1:8080/api";

interface JsonResponse {
  status: string;
  message?: string;
  data?: unknown;
}

async function postJson(path: string, body: unknown, token?: string): Promise<JsonResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as JsonResponse;
  if (!res.ok) {
    throw new Error(`POST ${path} failed (${res.status}): ${json.message ?? JSON.stringify(json)}`);
  }
  return json;
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signup(name: string, email: string, password: string): Promise<string> {
  const json = await postJson("/users/signup", { name, email, password });
  const data = json.data as { user: { id: string } };
  return data.user.id;
}

export async function login(email: string, password: string): Promise<string> {
  const json = await postJson("/users/login", { email, password });
  const data = json.data as { token: string };
  return data.token;
}

export async function promoteToCoach(userId: string): Promise<string> {
  const json = await postJson(`/admin/coaches/${userId}`, {
    experience_years: 5,
    description: "E2E fixture coach",
    profile_image_url: "https://example.com/coach.jpg",
  });
  const data = json.data as { coach: { id: string } };
  return data.coach.id;
}

export async function createSkill(token: string, name: string): Promise<string> {
  const json = await postJson("/coaches/skill", { name }, token);
  const data = json.data as { id: string };
  return data.id;
}

export async function createCourse(token: string, skillId: string, name: string): Promise<void> {
  const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  await postJson(
    "/admin/coaches/courses",
    {
      skill_id: skillId,
      name,
      description: "E2E fixture course",
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      max_participants: 10,
      meeting_url: "https://example.com/meeting",
    },
    token,
  );
}

export async function createCreditPackage(name: string, price: number, creditAmount: number): Promise<void> {
  await postJson("/credit-package", { name, price, credit_amount: creditAmount });
}
```

Every function here calls the real backend directly with `fetch` (Node 20+ has it built in — the README already requires Node >= 20) — this is fixture setup, not the thing under test, so it deliberately does not go through the frontend's `axios` client or any UI.

- [ ] **Step 3: Verify the config loads**

Make sure the backend and Postgres are running first (`docker compose up -d` from the repo root, `cd backend && npm run dev` in another terminal — or confirm they're already up with `curl http://127.0.0.1:8080/healthcheck`), then:

```bash
cd frontend && npx playwright test --list
```

Expected: `Total: 0 tests in 0 files` (no `.spec.ts` files exist yet) with no config-parsing errors. If this errors about a missing browser, run `npx playwright install chromium` first.

- [ ] **Step 4: Commit**

```bash
git add frontend/playwright.config.ts frontend/e2e/api-helpers.ts
git commit -m "test(e2e): add Playwright config and API fixture helpers"
```

Append this attribution trailer:
```
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

## Task 2: Member journey spec (signup → buy credits → book a course → view schedule)

**Files:**
- Create: `frontend/e2e/member-journey.spec.ts`

- [ ] **Step 1: Create `frontend/e2e/member-journey.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import {
  signup,
  login,
  promoteToCoach,
  createSkill,
  createCourse,
  createCreditPackage,
  uniqueEmail,
} from "./api-helpers";

const FIXTURE_PASSWORD = "Password1234";

test.describe("member journey: signup, buy credits, book a course, view schedule", () => {
  let memberEmail: string;
  let courseName: string;
  let packageName: string;
  let coachId: string;

  test.beforeAll(async () => {
    const coachEmail = uniqueEmail("e2e-coach");
    const coachUserId = await signup("E2E Fixture Coach", coachEmail, FIXTURE_PASSWORD);
    coachId = await promoteToCoach(coachUserId);
    const coachToken = await login(coachEmail, FIXTURE_PASSWORD);
    const skillId = await createSkill(coachToken, `E2E Skill ${Date.now()}`);
    courseName = `E2E Course ${Date.now()}`;
    await createCourse(coachToken, skillId, courseName);

    packageName = `E2E Package ${Date.now()}`;
    await createCreditPackage(packageName, 999, 5);

    memberEmail = uniqueEmail("e2e-member");
  });

  test("signup, buy credits, book the fixture course, see it on the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("姓名").fill("E2E Member");
    await page.getByLabel("Email").fill(memberEmail);
    await page.getByLabel("密碼").fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "註冊" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Email").fill(memberEmail);
    await page.getByLabel("密碼").fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "登入" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("link", { name: "教練列表" }).click();
    await expect(page.getByRole("heading", { name: "教練列表" })).toBeVisible();

    // Buy the fixture credit package
    await page.goto("/fitness-plans");
    const packageHeading = page.getByRole("heading", { name: packageName });
    await expect(packageHeading).toBeVisible();
    await packageHeading.locator("xpath=..").getByRole("button", { name: "購買" }).click();
    await page.locator(".swal2-confirm").click();
    await expect(page.locator(".swal2-title")).toHaveText("購買成功");
    await page.locator(".swal2-confirm").click();

    // Book the fixture course from its coach's own page (not the home page —
    // see this plan's "Context for the engineer" note on why)
    await page.goto(`/coaches/${coachId}`);
    const courseHeading = page.getByRole("heading", { name: courseName });
    await expect(courseHeading).toBeVisible();
    await courseHeading.locator("xpath=..").getByRole("button", { name: "報名" }).click();
    await page.locator(".swal2-confirm").click();
    await expect(page.locator(".swal2-title")).toHaveText("報名成功");
    await page.locator(".swal2-confirm").click();

    // View schedule
    await page.goto("/user/dashboard");
    await expect(page.getByRole("heading", { name: courseName })).toBeVisible();
    await expect(page.getByRole("button", { name: "取消報名" })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run it**

With the backend and Postgres running:

```bash
cd frontend && npx playwright test member-journey.spec.ts
```

Expected: `1 passed`. If it fails on the booking step with a `已無可使用堂數` SweetAlert error instead of `報名成功`, the credit-purchase step above it didn't actually succeed — check that failure first, don't skip ahead to debugging booking.

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/member-journey.spec.ts
git commit -m "test(e2e): add member journey spec (signup, buy credits, book, view schedule)"
```

Append the attribution trailer (same as Task 1).

---

## Task 3: Coach journey spec (skills, profile, course create/edit, earnings)

**Depends on the Coach Area plan** (`docs/superpowers/plans/2026-09-12-r-fitness-coach-area.md`) being merged — confirm `frontend/src/pages/coach/{SkillTagsView,ProfileView,CoursesView,EarningsView}.tsx` are real implementations, not placeholders, before starting.

**Files:**
- Create: `frontend/e2e/coach-journey.spec.ts`

- [ ] **Step 1: Create `frontend/e2e/coach-journey.spec.ts`**

```ts
import { test, expect } from "@playwright/test";
import { signup, login, promoteToCoach, uniqueEmail } from "./api-helpers";

const FIXTURE_PASSWORD = "Password1234";

test.describe("coach journey: skills, profile, course create/edit, earnings", () => {
  let coachEmail: string;

  test.beforeAll(async () => {
    coachEmail = uniqueEmail("e2e-coach-ui");
    const userId = await signup("E2E Coach UI", coachEmail, FIXTURE_PASSWORD);
    await promoteToCoach(userId);
  });

  test("manage skills and profile, create and edit a course, view earnings", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(coachEmail);
    await page.getByLabel("密碼").fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "登入" }).click();
    await expect(page.getByRole("link", { name: "教練後台" })).toBeVisible();

    // Add a skill tag
    await page.goto("/coach/skills");
    const skillName = `E2E Skill ${Date.now()}`;
    await page.getByPlaceholder("技能名稱").fill(skillName);
    await page.getByRole("button", { name: "新增" }).click();
    await expect(page.locator(".swal2-title")).toHaveText("已新增技能標籤");
    await page.locator(".swal2-confirm").click();
    await expect(page.getByText(skillName, { exact: true })).toBeVisible();

    // Edit profile: required fields plus the new skill
    await page.goto("/coach/profile");
    await page.getByLabel("教學經驗（年）").fill("5");
    await page.getByLabel("自我介紹").fill("E2E coach profile description.");
    await page.getByLabel(/個人照片網址/).fill("https://example.com/coach.jpg");
    await page.getByLabel(skillName, { exact: true }).check();
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page.locator(".swal2-title")).toHaveText("檔案已更新");
    await page.locator(".swal2-confirm").click();

    // Create a course using that skill
    await page.goto("/coach/courses");
    await page.getByRole("button", { name: "新增課程" }).click();
    await page.getByLabel("技能標籤").selectOption({ label: skillName });
    const courseName = `E2E Course ${Date.now()}`;
    await page.getByLabel("課程名稱").fill(courseName);
    await page.getByLabel("課程說明").fill("E2E course description.");
    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toLocalInputValue = (d: Date) => d.toISOString().slice(0, 16);
    await page.getByLabel("開始時間").fill(toLocalInputValue(start));
    await page.getByLabel("結束時間").fill(toLocalInputValue(end));
    await page.getByLabel("人數上限").fill("10");
    await page.getByLabel(/會議連結/).fill("https://example.com/meeting");
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page.locator(".swal2-title")).toHaveText("課程已建立");
    await page.locator(".swal2-confirm").click();
    await expect(page.getByRole("heading", { name: courseName })).toBeVisible();

    // Edit the course
    const courseHeading = page.getByRole("heading", { name: courseName });
    await courseHeading.locator("xpath=..").getByRole("button", { name: "編輯" }).click();
    await expect(page.getByRole("heading", { name: "編輯課程" })).toBeVisible();
    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByRole("heading", { name: "課程管理" })).toBeVisible();

    // Earnings page renders
    await page.goto("/coach/earnings");
    await expect(page.getByRole("heading", { name: "營收報表" })).toBeVisible();
    await expect(page.getByLabel("選擇月份查看明細")).toBeVisible();
  });
});
```

Note: `toLocalInputValue` deliberately uses `toISOString()` (UTC) rather than fiddling with local-timezone formatting — since both `start` and `end` go through the exact same transformation, the resulting `datetime-local` strings are still exactly 1 hour apart from each other regardless of what timezone the browser interprets them in, so the backend's "end after start" check still passes. Don't rely on this for asserting the actual displayed time, only for satisfying that ordering constraint.

- [ ] **Step 2: Run it**

```bash
cd frontend && npx playwright test coach-journey.spec.ts
```

Expected: `1 passed`.

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/coach-journey.spec.ts
git commit -m "test(e2e): add coach journey spec (skills, profile, course create/edit, earnings)"
```

Append the attribution trailer (same as Task 1).

---

## Task 4: Document the E2E prerequisites in the README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add an E2E prerequisites note**

Find this section in `README.md`:

```markdown
前端 E2E：

```bash
cd frontend && npm run test:e2e
```
```

Replace it with:

```markdown
前端 E2E（需要後端與 PostgreSQL 已啟動，見上方「本機啟動」）：

```bash
cd frontend && npm run test:e2e
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: note that E2E tests require the backend and Postgres running"
```

Append the attribution trailer (same as Task 1).

---

## Task 5: Full suite run

**Files:** none (verification only)

- [ ] **Step 1: Run the full suite**

With backend + Postgres running:

```bash
cd frontend && npm run test:e2e
```

Expected: `2 passed` (both spec files).

- [ ] **Step 2: Type-check the whole frontend one more time**

```bash
cd frontend && npx tsc -b
```

Expected: zero errors — the `e2e/` directory and `playwright.config.ts` are included in `tsconfig.json`'s `include: ["src", "tsconfig.node.json"]`... **check this**: if `npx tsc -b` doesn't pick up `frontend/e2e/**` or `frontend/playwright.config.ts` at all (likely, since `include` only lists `src`), that's fine — Playwright type-checks its own spec files internally when you run `npx playwright test` (Step 1 already proves they compile); don't add `e2e` to `tsconfig.json`'s `include` just to make `tsc -b` see it, since `frontend/tsconfig.node.json` (Vite/Node-side config) is a different `moduleResolution` context than what Playwright expects.

- [ ] **Step 3: Report results**

No commit for this task. Report the pass/fail output of `npm run test:e2e` verbatim.

---

## Self-review notes

- **Spec coverage**: Playwright config + fixture helpers ✓ (Task 1), the ADR-promised member journey plus credit purchase ✓ (Task 2), the user-requested coach-side journey ✓ (Task 3), documented prerequisites ✓ (Task 4), full suite run ✓ (Task 5).
- **Scope note**: Task 3 (coach-side E2E) is explicitly **beyond** what `docs/adr/0001-react-rewrite-for-portfolio.md` originally committed to (that ADR only promised the member-side path) — included here because the user explicitly asked for both when this plan was scoped, not silently assumed.
- **Type consistency check**: `api-helpers.ts`'s `signup`/`login`/`promoteToCoach`/`createSkill` return types (`Promise<string>`) match how both spec files consume them (`const coachUserId = await signup(...)`, etc. — never destructured as objects). `promoteToCoach`'s return (`coach.id`) is used directly as the `/coaches/:coachId` URL segment in `member-journey.spec.ts` — matches the public `GET /api/coaches/:coachId` route's param name.
- **Not in this plan**: wiring these specs into a CI workflow (`.github/workflows/*`) — no CI currently runs the frontend at all (per `docs/adr/0001`, only backend contract tests are CI-covered today), so adding a frontend CI job is out of scope here and would be its own plan if wanted later.
