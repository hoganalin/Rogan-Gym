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
  let creditAmount: number;

  test.beforeAll(async () => {
    const coachEmail = uniqueEmail("e2e-coach");
    await signup("E2E Fixture Coach", coachEmail, FIXTURE_PASSWORD);
    const coachToken = await login(coachEmail, FIXTURE_PASSWORD);
    coachId = await promoteToCoach(coachToken);
    const skillId = await createSkill(coachToken, `E2E Skill ${Date.now()}`);
    courseName = `E2E Course ${Date.now()}`;
    await createCourse(coachToken, skillId, courseName);

    packageName = `E2E Package ${Date.now()}`;
    creditAmount = 7;
    await createCreditPackage(packageName, 1400, creditAmount, coachToken);

    memberEmail = uniqueEmail("e2e-member");
  });

  test("signup, buy credits, book the fixture course, see it on the dashboard", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("姓名").fill("E2E Member");
    await page.getByLabel("電子郵件").fill(memberEmail);
    await page.getByLabel("密碼").fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "註冊" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("電子郵件").fill(memberEmail);
    await page.getByLabel("密碼").fill(FIXTURE_PASSWORD);
    await page.getByRole("button", { name: "登入" }).click();
    await expect(page).toHaveURL(/\/$/);

    // Scoped to the header nav: the new dark-theme footer also links to
    // "教練列表" (see frontend/src/components/RootLayout.tsx), so an
    // unscoped query is ambiguous now that both exist.
    await page.getByRole("navigation", { name: "主要導覽", exact: true }).getByRole("link", { name: "找教練" }).click();
    await expect(page.getByRole("heading", { name: "找到合拍的訓練夥伴。" })).toBeVisible();

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
    // CoachDetail's course card wraps the heading in its own inner div (unlike
    // the credit-package card above), so the "報名" button is a sibling two
    // levels up, not one.
    await page.locator(".course-row").filter({ has: courseHeading }).getByRole("button", { name: "報名" }).click();
    await page.locator(".swal2-confirm").click();
    await expect(page.locator(".swal2-title")).toHaveText("報名成功");
    await page.locator(".swal2-confirm").click();

    // View schedule
    await page.goto("/user/dashboard");
    await expect(page.getByRole("heading", { name: courseName })).toBeVisible();
    await expect(page.getByRole("button", { name: "取消報名" })).toBeVisible();
    await expect(page.getByText(`剩餘 ${creditAmount - 1} 堂`, { exact: false })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: courseName })).toBeVisible();
    await page.getByRole("button", { name: `取消報名 ${courseName}`, exact: true }).click();
    await page.locator(".swal2-confirm").click();
    await expect(page.locator(".swal2-title")).toHaveText("已取消報名");
    await page.locator(".swal2-confirm").click();
    await expect(page.getByText(`剩餘 ${creditAmount} 堂`, { exact: false })).toBeVisible();
    await page.reload();
    await expect(page.getByText(`剩餘 ${creditAmount} 堂`, { exact: false })).toBeVisible();
    await expect(page.getByRole("button", { name: "取消報名", exact: true })).toHaveCount(0);
    await page.goto("/user/orders");
    await expect(page.getByRole("heading", { name: packageName })).toBeVisible();
  });
});
