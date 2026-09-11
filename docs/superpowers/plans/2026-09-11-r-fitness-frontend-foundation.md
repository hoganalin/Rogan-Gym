# R Fitness Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the provided Vue 3 frontend in-place with a working React + TypeScript + Vite + Tailwind scaffold — typed API client for every backend endpoint, cookie-based JWT auth with role guards, and all 14 routes wired to real (if minimal) page components — plus scrub the four assignment-language files identified during planning. This is Plan 1 of a phased series; it produces a frontend that runs, logs in, and navigates correctly, but page content is intentionally minimal. Later plans (public pages, member area, coach area, E2E) build out each page's real UI on top of this foundation.

**Architecture:** Single-page app served by Vite dev server locally and by `serve` in Docker (same pattern as the previous Vue app). Axios instance with request/response interceptors handles auth headers and error normalization; a `ROUTE_TABLE` config (ported from the Vue app) decides which requests skip the auth header. `AuthContext` holds the decoded JWT role + user name, backed by a plain (non-httpOnly) cookie, matching the backend's existing contract. `ProtectedRoute` wraps role-gated routes.

**Tech Stack:** React 19, TypeScript, Vite 7, Tailwind CSS v4, react-router-dom v6, axios, jwt-decode, dayjs, sweetalert2 (kept from the original app), recharts (added for Plan 4's revenue chart, installed now so the dependency list is settled).

---

## Context for the engineer

- The existing `frontend/` folder is Vue 3 code that's being **fully replaced, not refactored**. Do not try to preserve any of its logic beyond what's ported below.
- The backend (`backend/`) **must not be modified** by this plan.
- Backend contract reference: `docs/openapi.yaml` and the controllers under `backend/controllers/`. All request/response shapes in this plan were read directly from those controllers — see the Task 3 type definitions for the source of truth.
- There is **no separate Admin role** in the backend (`backend/entities/User.js` only defines `role: "USER" | "COACH"`, default `"USER"`). The old Vue app's `/admin/*` routes (`PromoteTrainer.vue`, `SkillsView.vue`, `DashboardView.vue`) were just a UI grouping choice, not a backend-enforced role. This plan reclassifies those two real features into their proper role sections (see Task 5's route table) per `CONTEXT.md`'s flagged ambiguity. `admin/dashboard` is dropped entirely — `/user/dashboard` and `/coach/profile` already serve as the post-login landing pages for their respective roles.
- Cookie name is `token` (not httpOnly — readable by JS), exactly as the old app did it. Do not switch to a different storage mechanism; the backend's `isAuth` middleware just expects `Authorization: Bearer <token>`, so this is a frontend-only convention to preserve.

---

## File Structure

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── Dockerfile                      (unchanged — generic npm ci/build/serve, verified in Task 7)
├── .dockerignore                   (unchanged)
├── .env.example                    (unchanged: VITE_API_BASE_URL)
├── public/                         (unchanged — existing images/icons are reused later)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── style.css
    ├── vite-env.d.ts
    ├── types/
    │   └── api.ts
    ├── lib/
    │   ├── cookie.ts
    │   ├── routeTable.ts
    │   └── request.ts
    ├── api/
    │   ├── auth.ts
    │   ├── users.ts
    │   ├── creditPackage.ts
    │   ├── coachesPublic.ts
    │   ├── courses.ts
    │   ├── skill.ts
    │   └── coach.ts
    ├── context/
    │   └── AuthContext.tsx
    ├── components/
    │   ├── ProtectedRoute.tsx
    │   └── RootLayout.tsx
    ├── layouts/
    │   ├── UserLayout.tsx
    │   └── CoachLayout.tsx
    └── pages/
        ├── NotFound.tsx
        ├── public/
        │   ├── HomeView.tsx
        │   ├── CoachesView.tsx
        │   ├── CoachDetail.tsx
        │   ├── FitnessPlans.tsx
        │   └── auth/
        │       ├── LoginView.tsx
        │       └── SignupView.tsx
        ├── user/
        │   ├── DashboardView.tsx
        │   ├── ProfileView.tsx
        │   ├── OrdersView.tsx
        │   └── BecomeCoachView.tsx
        └── coach/
            ├── ProfileView.tsx
            ├── CoursesView.tsx
            ├── EarningsView.tsx
            └── SkillTagsView.tsx
```

---

## Task 1: Scaffold the Vite + React + TypeScript project

**Files:**
- Delete: `frontend/src/` (entire Vue source tree), `frontend/index.html`, `frontend/package.json`, `frontend/vite.config.js`, `frontend/eslint.config.js`, `frontend/COLOR_GUIDE.md`, `frontend/package-lock.json`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/vite-env.d.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx` (temporary minimal version, replaced fully in Task 5)

- [ ] **Step 1: Remove the old Vue source**

```bash
rm -rf frontend/src frontend/index.html frontend/vite.config.js frontend/eslint.config.js frontend/COLOR_GUIDE.md frontend/package.json frontend/package-lock.json
```

- [ ] **Step 2: Write `frontend/package.json`**

```json
{
  "name": "r-fitness-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.1.16",
    "axios": "^1.13.1",
    "dayjs": "^1.11.19",
    "jwt-decode": "^4.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.1",
    "recharts": "^2.15.0",
    "sweetalert2": "^11.26.3",
    "tailwindcss": "^4.1.16"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^7.1.7"
  }
}
```

- [ ] **Step 3: Write `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tsconfig.node.json"]
}
```

- [ ] **Step 4: Write `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Write `frontend/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 6: Write `frontend/index.html`**

```html
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>R Fitness</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 8: Write a temporary `frontend/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: Write a temporary `frontend/src/App.tsx`**

```tsx
export default function App() {
  return <h1>R Fitness — scaffold OK</h1>;
}
```

- [ ] **Step 10: Install dependencies and verify the dev server boots**

```bash
cd frontend && npm install
```

```bash
npm run dev
```

Expected: Vite prints a local URL (e.g. `http://localhost:5173/`); opening it shows "R Fitness — scaffold OK". Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 11: Commit**

```bash
cd .. && git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/index.html frontend/src/main.tsx frontend/src/App.tsx frontend/src/vite-env.d.ts
git add -u frontend
git commit -m "feat(frontend): scaffold Vite + React + TypeScript project"
```

---

## Task 2: Tailwind v4 setup and R Fitness brand theme

**Files:**
- Create: `frontend/src/style.css`
- Modify: `frontend/src/main.tsx` (import the stylesheet)

- [ ] **Step 1: Write `frontend/src/style.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #fff3ed;
  --color-brand-100: #ffe4d6;
  --color-brand-200: #ffc7ad;
  --color-brand-300: #ffa378;
  --color-brand-400: #ff7a47;
  --color-brand-500: #f4501e;
  --color-brand-600: #d93c10;
  --color-brand-700: #b32e0c;
  --color-brand-800: #8c240d;
  --color-brand-900: #71200e;
  --color-brand-950: #3d0e05;

  --font-display: "system-ui", "Noto Sans TC", sans-serif;
}

body {
  @apply bg-slate-50 text-slate-900 antialiased;
}
```

- [ ] **Step 2: Import the stylesheet in `frontend/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Verify Tailwind compiles**

```bash
cd frontend && npm run dev
```

Edit `App.tsx` temporarily to include `<h1 className="text-brand-600 font-display text-3xl">R Fitness</h1>` and confirm the heading renders in the brand orange in the browser. Revert `App.tsx` back to the plain version from Task 1 Step 9 afterward (Task 5 replaces it for real).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/style.css frontend/src/main.tsx
git commit -m "feat(frontend): add Tailwind v4 with R Fitness brand theme"
```

---

## Task 3: Typed API client

**Files:**
- Create: `frontend/src/types/api.ts`
- Create: `frontend/src/lib/cookie.ts`
- Create: `frontend/src/lib/routeTable.ts`
- Create: `frontend/src/lib/request.ts`
- Create: `frontend/src/api/auth.ts`
- Create: `frontend/src/api/users.ts`
- Create: `frontend/src/api/creditPackage.ts`
- Create: `frontend/src/api/coachesPublic.ts`
- Create: `frontend/src/api/courses.ts`
- Create: `frontend/src/api/skill.ts`
- Create: `frontend/src/api/coach.ts`

- [ ] **Step 1: Write `frontend/src/types/api.ts`**

```ts
export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiErrorBody {
  status: "failed" | "error";
  message: string;
}

export type Role = "USER" | "COACH";

export interface AuthUser {
  name: string;
  role: Role;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignupResult {
  user: { id: string; name: string; email: string };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: { name: string };
}

export interface UserProfile {
  name: string;
  email: string;
}

export interface UpdatePasswordPayload {
  password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  price: number;
  credit_amount: number;
}

export interface CreditPurchase {
  name?: string;
  purchased_credits: number;
  price_paid: number;
  purchase_at: string;
}

export interface UserCourseBooking {
  course_id: string;
  name: string;
  start_at: string;
  end_at: string;
  meeting_url: string;
  coach_name: string;
  cancelled_at: string | null;
}

export interface UserCoursesResult {
  credit_remain: number;
  credit_usage: number;
  course_booking: UserCourseBooking[];
}

export interface CoachListItem {
  id: string;
  user_id: string;
  name: string;
}

export interface CoachDetail {
  user: { name: string; role: Role };
  coach: {
    id: string;
    user_id: string;
    experience_years: number;
    description: string;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
    skills: string[];
  };
}

export interface PublicCourse {
  id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  coach_name: string;
  skill_name: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface CoachSelf {
  id: string;
  experience_years: number;
  description: string;
  profile_image_url: string | null;
  skill_ids: string[];
}

export interface CoachSelfUpdatePayload {
  skill_ids: string[];
  experience_years: number;
  description: string;
  profile_image_url: string;
}

export type CourseStatus = "尚未開始" | "進行中" | "已結束";

export interface CoachCourseListItem {
  id: string;
  name: string;
  status: CourseStatus;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
  participants: number;
}

export interface CoachCourseDetail {
  id: string;
  skill_name: string;
  skill_id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
}

export interface CoachCoursePayload {
  skill_id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  max_participants: number;
  meeting_url: string;
}

export interface RevenueResult {
  total: {
    revenue: number;
    participants: number;
    course_count: number;
  };
}

export interface PromoteCoachPayload {
  experience_years: number;
  description: string;
  profile_image_url?: string;
}

export interface PromoteCoachResult {
  user: { name: string; role: Role };
  coach: {
    id: string;
    user_id: string;
    experience_years: number;
    description: string;
    profile_image_url: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

- [ ] **Step 2: Write `frontend/src/lib/cookie.ts`**

```ts
import dayjs from "dayjs";

export function getDataFromCookieByKey(key: string): string | null {
  const name = `${key}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (const raw of cookieArray) {
    const cookie = raw.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

export function setKeyFromCookie(name: string, token: string, exp: number): void {
  const expiresDate = dayjs(exp * 1000).toISOString();
  document.cookie = `${name}=${token}; expires=${expiresDate}; path=/`;
}

export function removeCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}
```

- [ ] **Step 3: Write `frontend/src/lib/routeTable.ts`**

Ported from the Vue app's `config/routeTable.js` — decides which requests are sent without an `Authorization` header.

```ts
type RoutePattern = string | RegExp;

export const ROUTE_TABLE: Record<string, true | RoutePattern[]> = {
  "post-users": ["/signup", "/login"],
  "get-courses": true,
  "get-credit-package": true,
  "post-credit-package": true,
  "get-coaches": [
    "/skill",
    /^\/[0-9a-f-]+$/i, // /:coachId
    /^\/\?.*$/, // /?per=&page=
    /^\/[0-9a-f-]+\/courses$/i, // /:coachId/courses
  ],
  "post-coaches": ["/skill"],
  "delete-coaches": [/^\/skill\/[0-9a-f-]+$/i],
};
```

- [ ] **Step 4: Write `frontend/src/lib/request.ts`**

```ts
import axios from "axios";
import { getDataFromCookieByKey } from "./cookie";
import { ROUTE_TABLE } from "./routeTable";

function verifyRoute(prefix: string, route: string, method: string): boolean {
  const key = `${method}-${prefix}`;
  const hasSubRoute = route.length > prefix.length;

  if (!Object.hasOwn(ROUTE_TABLE, key) && !hasSubRoute) {
    return false;
  }

  const config = ROUTE_TABLE[key];
  const subRoute = route.replace(prefix, "");

  if (subRoute === "") {
    return true;
  }

  if (Array.isArray(config)) {
    for (const pattern of config) {
      if (typeof pattern === "string" && subRoute === pattern) {
        return true;
      }
      if (pattern instanceof RegExp && pattern.test(subRoute)) {
        return true;
      }
    }
  }

  return false;
}

function notNeedAuth(url: string, method: string): boolean {
  const prefix = url.split("/")[0];
  return verifyRoute(prefix, url, method);
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const url = config.url ?? "";
  const method = config.method ?? "get";

  if (notNeedAuth(url, method)) {
    return config;
  }

  const token = getDataFromCookieByKey("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  },
);

export default request;
```

Note: unlike the Vue version, this does not `console.error` per status code in the interceptor — that responsibility moves to each call site / `AuthContext`, so error messages (like the four fixed M5 strings) can be surfaced in the UI instead of only the console. This is a deliberate improvement, not a missed port.

- [ ] **Step 5: Write `frontend/src/api/auth.ts`**

```ts
import request from "../lib/request";
import type { ApiSuccess, LoginPayload, LoginResult, SignupPayload, SignupResult } from "../types/api";

export function postSignup(data: SignupPayload) {
  return request.post<never, ApiSuccess<SignupResult>>("users/signup", data);
}

export function postLogin(data: LoginPayload) {
  return request.post<never, ApiSuccess<LoginResult>>("users/login", data);
}
```

- [ ] **Step 6: Write `frontend/src/api/users.ts`**

```ts
import request from "../lib/request";
import type {
  ApiSuccess,
  CreditPurchase,
  UpdatePasswordPayload,
  UserCoursesResult,
  UserProfile,
} from "../types/api";

export function getUserProfile() {
  return request.get<never, ApiSuccess<{ user: UserProfile }>>("users/profile");
}

export function putUserProfile(data: { name: string }) {
  return request.put<never, ApiSuccess<{ user: { name: string } }>>("users/profile", data);
}

export function putUserPassword(data: UpdatePasswordPayload) {
  return request.put<never, ApiSuccess<null>>("users/password", data);
}

export function getUserCourses() {
  return request.get<never, ApiSuccess<UserCoursesResult>>("users/courses");
}

export function getUserCreditPackage() {
  return request.get<never, ApiSuccess<CreditPurchase[]>>("users/credit-package");
}
```

- [ ] **Step 7: Write `frontend/src/api/creditPackage.ts`**

```ts
import request from "../lib/request";
import type { ApiSuccess, CreditPackage } from "../types/api";

export function getCreditPackages() {
  return request.get<never, ApiSuccess<CreditPackage[]>>("credit-package");
}

export function postCreditPackage(id: string) {
  return request.post<never, ApiSuccess<null>>(`credit-package/${id}`);
}
```

- [ ] **Step 8: Write `frontend/src/api/coachesPublic.ts`**

```ts
import request from "../lib/request";
import type { ApiSuccess, CoachDetail, CoachListItem, PublicCourse } from "../types/api";

export function getCoaches(per: number, page: number) {
  return request.get<never, ApiSuccess<CoachListItem[]>>(`coaches/?per=${per}&page=${page}`);
}

export function getCoachDetail(coachId: string) {
  return request.get<never, ApiSuccess<CoachDetail>>(`coaches/${coachId}`);
}

export function getCoachCourses(coachId: string) {
  return request.get<never, ApiSuccess<PublicCourse[]>>(`coaches/${coachId}/courses`);
}
```

- [ ] **Step 9: Write `frontend/src/api/courses.ts`**

```ts
import request from "../lib/request";
import type { ApiSuccess, PublicCourse } from "../types/api";

export function getCourses() {
  return request.get<never, ApiSuccess<PublicCourse[]>>("courses");
}

export function postCourseBooking(courseId: string) {
  return request.post<never, ApiSuccess<null>>(`courses/${courseId}`);
}

export function deleteCourseBooking(courseId: string) {
  return request.delete<never, ApiSuccess<null>>(`courses/${courseId}`);
}
```

- [ ] **Step 10: Write `frontend/src/api/skill.ts`**

```ts
import request from "../lib/request";
import type { ApiSuccess, Skill } from "../types/api";

export function getSkills() {
  return request.get<never, ApiSuccess<Skill[]>>("coaches/skill");
}

export function postSkill(name: string) {
  return request.post<never, ApiSuccess<Skill>>("coaches/skill", { name });
}

export function deleteSkill(id: string) {
  return request.delete<never, ApiSuccess<null>>(`coaches/skill/${id}`);
}
```

- [ ] **Step 11: Write `frontend/src/api/coach.ts`**

```ts
import request from "../lib/request";
import type {
  ApiSuccess,
  CoachCourseDetail,
  CoachCourseListItem,
  CoachCoursePayload,
  CoachSelf,
  CoachSelfUpdatePayload,
  PromoteCoachPayload,
  PromoteCoachResult,
  RevenueResult,
} from "../types/api";

export function getCoachSelf() {
  return request.get<never, ApiSuccess<CoachSelf>>("admin/coaches");
}

export function putCoachSelf(data: CoachSelfUpdatePayload) {
  return request.put<never, ApiSuccess<CoachSelf>>("admin/coaches", data);
}

export function getCoachCourseList() {
  return request.get<never, ApiSuccess<CoachCourseListItem[]>>("admin/coaches/courses");
}

export function getCoachCourseDetail(courseId: string) {
  return request.get<never, ApiSuccess<CoachCourseDetail>>(`admin/coaches/courses/${courseId}`);
}

export function postCoachCourse(data: CoachCoursePayload) {
  return request.post<never, ApiSuccess<{ course: CoachCourseDetail }>>("admin/coaches/courses", data);
}

export function putCoachCourse(courseId: string, data: CoachCoursePayload) {
  return request.put<never, ApiSuccess<{ course: CoachCourseDetail }>>(`admin/coaches/courses/${courseId}`, data);
}

export function getMonthlyRevenue(month: string) {
  return request.get<never, ApiSuccess<RevenueResult>>(`admin/coaches/revenue?month=${month}`);
}

export function postPromoteUserToCoach(userId: string, data: PromoteCoachPayload) {
  return request.post<never, ApiSuccess<PromoteCoachResult>>(`admin/coaches/${userId}`, data);
}
```

- [ ] **Step 12: Type-check**

```bash
cd frontend && npx tsc -b
```

Expected: no errors. Fix any type mismatches before continuing.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/types frontend/src/lib frontend/src/api
git commit -m "feat(frontend): add typed API client for all backend endpoints"
```

---

## Task 4: Auth context and route guard

**Files:**
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Write `frontend/src/context/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { getDataFromCookieByKey, removeCookie, setKeyFromCookie } from "../lib/cookie";
import { postLogin, postSignup } from "../api/auth";
import { getUserProfile } from "../api/users";
import type { AuthUser, LoginPayload, Role, SignupPayload } from "../types/api";

interface DecodedToken {
  id: string;
  role: Role;
  exp: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getDataFromCookieByKey("token");
    if (!token) {
      setLoading(false);
      return;
    }

    getUserProfile()
      .then(({ data }) => {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({ name: data.user.name, role: decoded.role });
      })
      .catch(() => {
        removeCookie("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const { data } = await postLogin(payload);
    const decoded = jwtDecode<DecodedToken>(data.token);
    setKeyFromCookie("token", data.token, decoded.exp);
    setUser({ name: data.user.name, role: decoded.role });
  }

  async function signup(payload: SignupPayload) {
    await postSignup(payload);
  }

  function logout() {
    removeCookie("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
```

- [ ] **Step 2: Write `frontend/src/components/ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/api";

export function ProtectedRoute({ requiredRole }: { requiredRole: Role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context frontend/src/components/ProtectedRoute.tsx
git commit -m "feat(frontend): add auth context and role-based route guard"
```

---

## Task 5: Layouts, page stubs, and the full route table

**Files:**
- Create: `frontend/src/components/RootLayout.tsx`
- Create: `frontend/src/layouts/UserLayout.tsx`
- Create: `frontend/src/layouts/CoachLayout.tsx`
- Create: `frontend/src/pages/NotFound.tsx`
- Create: `frontend/src/pages/public/HomeView.tsx`
- Create: `frontend/src/pages/public/CoachesView.tsx`
- Create: `frontend/src/pages/public/CoachDetail.tsx`
- Create: `frontend/src/pages/public/FitnessPlans.tsx`
- Create: `frontend/src/pages/public/auth/LoginView.tsx`
- Create: `frontend/src/pages/public/auth/SignupView.tsx`
- Create: `frontend/src/pages/user/DashboardView.tsx`
- Create: `frontend/src/pages/user/ProfileView.tsx`
- Create: `frontend/src/pages/user/OrdersView.tsx`
- Create: `frontend/src/pages/user/BecomeCoachView.tsx`
- Create: `frontend/src/pages/coach/ProfileView.tsx`
- Create: `frontend/src/pages/coach/CoursesView.tsx`
- Create: `frontend/src/pages/coach/EarningsView.tsx`
- Create: `frontend/src/pages/coach/SkillTagsView.tsx`
- Modify: `frontend/src/App.tsx` (replace scaffold version with the full router)

Each page below is intentionally minimal — a real, rendering component with the right heading and one real sentence of Taiwanese-gym-appropriate Traditional Chinese copy — so routing and guards can be verified end-to-end now. Later plans replace the body of each page with the actual feature UI without touching the route structure or file names.

- [ ] **Step 1: Write `frontend/src/components/RootLayout.tsx`**

```tsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RootLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-xl font-bold text-brand-600">
            R Fitness
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/coaches">教練列表</Link>
            <Link to="/fitness-plans">健身方案</Link>
            {user?.role === "USER" && <Link to="/user/dashboard">我的課表</Link>}
            {user?.role === "COACH" && <Link to="/coach/profile">教練後台</Link>}
            {user ? (
              <button onClick={logout} className="text-brand-600">
                登出（{user.name}）
              </button>
            ) : (
              <>
                <Link to="/login">登入</Link>
                <Link to="/signup">註冊</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} R Fitness
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Write `frontend/src/layouts/UserLayout.tsx`**

```tsx
import { Link, Outlet } from "react-router-dom";

export function UserLayout() {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-8">
      <aside className="flex flex-col gap-2 text-sm">
        <Link to="/user/dashboard">我的課表</Link>
        <Link to="/user/profile">會員資料</Link>
        <Link to="/user/orders">購買紀錄</Link>
        <Link to="/user/become-coach">成為教練</Link>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Write `frontend/src/layouts/CoachLayout.tsx`**

```tsx
import { Link, Outlet } from "react-router-dom";

export function CoachLayout() {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-8">
      <aside className="flex flex-col gap-2 text-sm">
        <Link to="/coach/profile">教練檔案</Link>
        <Link to="/coach/courses">課程管理</Link>
        <Link to="/coach/earnings">營收報表</Link>
        <Link to="/coach/skills">技能標籤</Link>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Write `frontend/src/pages/NotFound.tsx`**

```tsx
import { Navigate } from "react-router-dom";

export default function NotFound() {
  return <Navigate to="/" replace />;
}
```

- [ ] **Step 5: Write `frontend/src/pages/public/HomeView.tsx`**

```tsx
export default function HomeView() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">R Fitness</h1>
      <p className="mt-2 text-slate-600">找到你的教練，安排屬於你的訓練課表。</p>
    </div>
  );
}
```

- [ ] **Step 6: Write `frontend/src/pages/public/CoachesView.tsx`**

```tsx
export default function CoachesView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">教練列表</h1>
      <p className="mt-2 text-slate-600">瀏覽 R Fitness 所有教練，尋找適合你的訓練夥伴。</p>
    </div>
  );
}
```

- [ ] **Step 7: Write `frontend/src/pages/public/CoachDetail.tsx`**

```tsx
import { useParams } from "react-router-dom";

export default function CoachDetail() {
  const { coachId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">教練詳情</h1>
      <p className="mt-2 text-slate-600">教練 ID：{coachId}</p>
    </div>
  );
}
```

- [ ] **Step 8: Write `frontend/src/pages/public/FitnessPlans.tsx`**

```tsx
export default function FitnessPlans() {
  return (
    <div>
      <h1 className="text-2xl font-bold">健身方案</h1>
      <p className="mt-2 text-slate-600">購買堂數方案，開始報名課程。</p>
    </div>
  );
}
```

- [ ] **Step 9: Write `frontend/src/pages/public/auth/LoginView.tsx`**

```tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError("登入失敗，請確認帳號密碼是否正確。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">登入</h1>
      <label className="mt-4 block text-sm">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      <label className="mt-4 block text-sm">
        密碼
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <button type="submit" className="mt-6 w-full rounded bg-brand-600 py-2 text-white">
        登入
      </button>
    </form>
  );
}
```

- [ ] **Step 10: Write `frontend/src/pages/public/auth/SignupView.tsx`**

```tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function SignupView() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signup({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError("註冊失敗，請確認欄位是否符合規則（密碼需 8-16 碼含大小寫英數字）。");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">註冊</h1>
      <label className="mt-4 block text-sm">
        姓名
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      <label className="mt-4 block text-sm">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      <label className="mt-4 block text-sm">
        密碼
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          required
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      <button type="submit" className="mt-6 w-full rounded bg-brand-600 py-2 text-white">
        註冊
      </button>
    </form>
  );
}
```

- [ ] **Step 11: Write `frontend/src/pages/user/DashboardView.tsx`**

```tsx
export default function DashboardView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">我的課表</h1>
      <p className="mt-2 text-slate-600">查看剩餘堂數與已報名的課程。</p>
    </div>
  );
}
```

- [ ] **Step 12: Write `frontend/src/pages/user/ProfileView.tsx`**

```tsx
export default function ProfileView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">會員資料</h1>
      <p className="mt-2 text-slate-600">修改暱稱與密碼。</p>
    </div>
  );
}
```

- [ ] **Step 13: Write `frontend/src/pages/user/OrdersView.tsx`**

```tsx
export default function OrdersView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">購買紀錄</h1>
      <p className="mt-2 text-slate-600">查看歷史方案購買紀錄。</p>
    </div>
  );
}
```

- [ ] **Step 14: Write `frontend/src/pages/user/BecomeCoachView.tsx`**

```tsx
export default function BecomeCoachView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">成為教練</h1>
      <p className="mt-2 text-slate-600">填寫經歷與自我介紹，升級為 R Fitness 教練。</p>
    </div>
  );
}
```

- [ ] **Step 15: Write `frontend/src/pages/coach/ProfileView.tsx`**

```tsx
export default function ProfileView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">教練檔案</h1>
      <p className="mt-2 text-slate-600">維護個人簡介、經歷年資與技能標籤。</p>
    </div>
  );
}
```

- [ ] **Step 16: Write `frontend/src/pages/coach/CoursesView.tsx`**

```tsx
export default function CoursesView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">課程管理</h1>
      <p className="mt-2 text-slate-600">新增、編輯你開設的課程。</p>
    </div>
  );
}
```

- [ ] **Step 17: Write `frontend/src/pages/coach/EarningsView.tsx`**

```tsx
export default function EarningsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">營收報表</h1>
      <p className="mt-2 text-slate-600">查看指定月份的營收統計。</p>
    </div>
  );
}
```

- [ ] **Step 18: Write `frontend/src/pages/coach/SkillTagsView.tsx`**

```tsx
export default function SkillTagsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold">技能標籤</h1>
      <p className="mt-2 text-slate-600">新增或移除課程與教練檔案可選用的技能標籤。</p>
    </div>
  );
}
```

- [ ] **Step 19: Replace `frontend/src/App.tsx` with the full router**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/RootLayout";
import { UserLayout } from "./layouts/UserLayout";
import { CoachLayout } from "./layouts/CoachLayout";
import NotFound from "./pages/NotFound";
import HomeView from "./pages/public/HomeView";
import CoachesView from "./pages/public/CoachesView";
import CoachDetail from "./pages/public/CoachDetail";
import FitnessPlans from "./pages/public/FitnessPlans";
import LoginView from "./pages/public/auth/LoginView";
import SignupView from "./pages/public/auth/SignupView";
import UserDashboardView from "./pages/user/DashboardView";
import UserProfileView from "./pages/user/ProfileView";
import OrdersView from "./pages/user/OrdersView";
import BecomeCoachView from "./pages/user/BecomeCoachView";
import CoachProfileView from "./pages/coach/ProfileView";
import CoachCoursesView from "./pages/coach/CoursesView";
import EarningsView from "./pages/coach/EarningsView";
import SkillTagsView from "./pages/coach/SkillTagsView";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<HomeView />} />
            <Route path="coaches" element={<CoachesView />} />
            <Route path="coaches/:coachId" element={<CoachDetail />} />
            <Route path="fitness-plans" element={<FitnessPlans />} />
            <Route path="login" element={<LoginView />} />
            <Route path="signup" element={<SignupView />} />

            <Route path="user" element={<ProtectedRoute requiredRole="USER" />}>
              <Route element={<UserLayout />}>
                <Route index element={<UserDashboardView />} />
                <Route path="dashboard" element={<UserDashboardView />} />
                <Route path="profile" element={<UserProfileView />} />
                <Route path="orders" element={<OrdersView />} />
                <Route path="become-coach" element={<BecomeCoachView />} />
              </Route>
            </Route>

            <Route path="coach" element={<ProtectedRoute requiredRole="COACH" />}>
              <Route element={<CoachLayout />}>
                <Route index element={<CoachProfileView />} />
                <Route path="profile" element={<CoachProfileView />} />
                <Route path="courses" element={<CoachCoursesView />} />
                <Route path="earnings" element={<EarningsView />} />
                <Route path="skills" element={<SkillTagsView />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 20: Manual verification**

```bash
cd frontend && npm run dev
```

In the browser:
1. Visit `/` — home page renders with nav.
2. Visit `/user/dashboard` while logged out — redirected to `/login`.
3. Sign up a test account, then log in — nav shows "登出（<name>）" and "我的課表" link (not "教練後台", since a fresh signup is role `USER`).
4. Visit `/coach/profile` while logged in as a `USER` — redirected to `/`.
5. Visit `/nonsense-path` — redirected to `/`.

- [ ] **Step 21: Commit**

```bash
git add frontend/src/components/RootLayout.tsx frontend/src/layouts frontend/src/pages frontend/src/App.tsx
git commit -m "feat(frontend): wire full route table with role-guarded layouts and page stubs"
```

---

## Task 6: De-schoolify metadata cleanup

**Files:**
- Modify: `README.md` (full rewrite)
- Modify: `package.json:5` (root)
- Modify: `docs/openapi.yaml:3`
- Modify: `.github/workflows/test.yml:1`

- [ ] **Step 1: Rewrite `README.md`**

```markdown
# R Fitness

健身房課程預約平台。會員可以瀏覽教練、購買堂數方案、報名課程；教練可以維護個人檔案、開設課程、查看月營收統計。

## 技術棧

- **後端**：Node.js、Express、TypeORM、PostgreSQL、JWT 驗證
- **前端**：React、TypeScript、Vite、Tailwind CSS、Recharts
- **測試**：Jest + Supertest（後端 API contract tests）、Playwright（前端 E2E）
- **容器化**：Docker Compose（frontend / backend / postgres / swagger）

## 本機啟動

1. 安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，並確認 Node.js 版本 >= 20
2. `docker compose up -d` 啟動前端（`http://localhost:3000`）、Swagger 文件（`http://localhost:8081`）、PostgreSQL（`localhost:5432`）
3. 進入 `backend/`，複製 `.env.example` 為 `.env`，執行 `npm install` 後 `npm run dev`，後端會跑在 `http://localhost:8080`

## 測試

```bash
npm test              # 全部後端 contract tests
npm run test:m1       # 分模組測試（m1 ~ m6）
```

前端 E2E：

```bash
cd frontend && npm run test:e2e
```

## 專案文件

- 領域詞彙與關係：[CONTEXT.md](CONTEXT.md)
- 架構決策紀錄：[docs/adr/](docs/adr/)
- API 規格：[docs/openapi.yaml](docs/openapi.yaml)（Swagger UI：`http://localhost:8081`）
```

- [ ] **Step 2: Edit `package.json` description**

```json
  "description": "R Fitness — 健身房課程預約平台，後端 API 與前端。",
```

- [ ] **Step 3: Edit `docs/openapi.yaml` title**

```yaml
  title: R Fitness API
```

- [ ] **Step 4: Edit `.github/workflows/test.yml` name**

```yaml
name: 後端 Contract Tests
```

- [ ] **Step 5: Verify CI still parses and root scripts still work**

```bash
npm test
```

Expected: same pass/fail result as before this task (this workflow doesn't touch frontend at all, so no test should change status). Confirm `git diff .github/workflows/test.yml` only changed the `name:` line — the rest of the workflow logic must stay untouched.

- [ ] **Step 6: Commit**

```bash
git add README.md package.json docs/openapi.yaml .github/workflows/test.yml
git commit -m "docs: rewrite README and scrub assignment references from metadata"
```

---

## Task 7: End-to-end verification (dev + Docker)

**Files:** none (verification only)

- [ ] **Step 1: Full local dev smoke test**

Terminal A:
```bash
cd backend && npm run dev
```

Terminal B:
```bash
cd frontend && npm run dev
```

In the browser, repeat Task 5 Step 20's checklist against the real backend (not just route guards): sign up, log in, confirm the nav updates, log out, confirm redirect behavior.

- [ ] **Step 2: Type-check and build**

```bash
cd frontend && npx tsc -b && npm run build
```

Expected: `dist/` is produced with no TypeScript errors.

- [ ] **Step 3: Verify the existing Dockerfile still works unmodified**

```bash
cd .. && docker compose build frontend
docker compose up -d frontend postgres
```

Visit `http://localhost:3000` — the React app should load (the frontend container talks to a backend that isn't running yet in this step, so login will fail with a network error — that's expected; this step only verifies the *build and serve* pipeline, not full functionality).

```bash
docker compose down
```

- [ ] **Step 4: Report any Dockerfile changes needed**

If Step 3 fails, the most likely cause is the Node version in `frontend/Dockerfile`'s `FROM node:24-alpine3.22` not matching a dependency's engine requirement — check the build log and bump the tag if needed. Do not change the multi-stage structure (build → `serve -s . -l 80`); it's already correct for a Vite output.

---

## Self-review notes

- **Spec coverage**: scaffold ✓ (Task 1), Tailwind + brand theme ✓ (Task 2), typed API client for every endpoint read from the controllers ✓ (Task 3), auth + role guard ✓ (Task 4), all 14 target routes wired ✓ (Task 5), de-schoolify of the 4 agreed files ✓ (Task 6), Docker/dev verification ✓ (Task 7).
- **Not in this plan** (deferred to later plans, per the phased breakdown discussed during planning): real page UI/data-fetching for each route, Recharts revenue chart wiring, sweetalert2 usage, Playwright E2E test itself, brand visual assets (logo/favicon redesign).
- **Known open item surfaced during research, not acted on here**: `backend/`, `test/`, `docs/openapi.yaml` body, and `docker-compose.yml` contain some leftover legacy wording beyond the 4 files cleaned in Task 6. These were intentionally left alone because `backend/` is explicitly out of scope for this rewrite (per `docs/adr/0001-react-rewrite-for-portfolio.md`). Flag as a separate, optional decision — not part of this plan.
