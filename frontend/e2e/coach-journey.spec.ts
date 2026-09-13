import { test, expect } from "@playwright/test";
import { signup, promoteToCoach, uniqueEmail } from "./api-helpers";

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

    // Reload and confirm the profile edit actually persisted server-side,
    // not just a client-side echo of the PUT response (this exact page once
    // had a backend bug where the save looked successful but never wrote the
    // scalar fields to the database — see commit 6e2f67c).
    await page.reload();
    await expect(page.getByLabel("教學經驗（年）")).toHaveValue("5");
    await expect(page.getByLabel(skillName, { exact: true })).toBeChecked();

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

    // Edit the course — actually submit a change and confirm it persists,
    // not just open-then-cancel the form (PUT .../courses/:id resends every
    // field, so this also proves the pre-fill from GET .../courses/:id round-trips
    // correctly into a successful full resend).
    const courseHeading = page.getByRole("heading", { name: courseName });
    // CoursesView's course card wraps the heading (and its detail paragraphs) in
    // its own inner div, sibling to the "編輯" button, both inside an outer
    // flex div (see frontend/src/pages/coach/CoursesView.tsx) — so the button
    // is a sibling two levels up from the heading, not one.
    await courseHeading.locator("xpath=../..").getByRole("button", { name: "編輯" }).click();
    await expect(page.getByRole("heading", { name: "編輯課程" })).toBeVisible();
    const updatedCourseName = `${courseName}（已編輯）`;
    await page.getByLabel("課程名稱").fill(updatedCourseName);
    await page.getByRole("button", { name: "儲存" }).click();
    await expect(page.locator(".swal2-title")).toHaveText("課程已更新");
    await page.locator(".swal2-confirm").click();
    await expect(page.getByRole("heading", { name: "課程管理" })).toBeVisible();
    await expect(page.getByRole("heading", { name: updatedCourseName })).toBeVisible();
    await expect(page.getByRole("heading", { name: courseName, exact: true })).not.toBeVisible();

    // Reload and confirm the edit persisted server-side, not just a
    // client-side echo of the PUT response.
    await page.reload();
    await expect(page.getByRole("heading", { name: updatedCourseName })).toBeVisible();

    // Earnings page renders
    await page.goto("/coach/earnings");
    await expect(page.getByRole("heading", { name: "營收報表" })).toBeVisible();
    await expect(page.getByLabel("選擇月份查看明細")).toBeVisible();
  });
});
