import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const start = Date.now() + 2 * 86400000;
  await page.route("**/api/**", route => {
    if (!["xhr", "fetch"].includes(route.request().resourceType())) return route.continue();
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (/coaches\/?$/.test(path)) data = [{ id: "1", name: "林教練" }];
    else if (path.endsWith("/coaches/1")) data = { user: { name: "林教練" }, coach: { skills: ["肌力"], experience_years: 5 } };
    else if (path.endsWith("/coaches/1/courses")) data = Array.from({ length: 40 }, (_, index) => ({
      id: `course-${index}`, name: `訓練 ${index + 1}`, description: "循序練習", coach_name: "林教練",
      skill_name: index < 4 ? "核心" : "肌力", max_participants: 8,
      start_at: new Date(start + index * 3600000).toISOString(),
      end_at: new Date(start + (index + 1) * 3600000).toISOString(),
    }));
    return route.fulfill({ json: { status: "success", data } });
  });
});

test("schedule paginates with three numbers, ellipses, persisted URL and filter reset", async ({ page }) => {
  await page.goto("/schedule");
  const pagination = page.getByRole("navigation", { name: "課程分頁" });
  await expect(page.locator(".course-row")).toHaveCount(6);
  await expect(pagination.getByRole("button", { name: "上一頁" })).toBeDisabled();
  await expect(pagination.locator("button[aria-label^='第']")).toHaveText(["1", "2", "3"]);
  await expect(pagination.getByText("…", { exact: true })).toHaveCount(1);
  await pagination.getByRole("button", { name: "第 3 頁" }).click();
  await expect(page).toHaveURL(/page=3/);
  await expect(page.getByRole("heading", { name: "訓練 13", exact: true })).toBeVisible();
  await expect(pagination.locator("button[aria-label^='第']")).toHaveText(["2", "3", "4"]);
  await expect(pagination.getByText("…", { exact: true })).toHaveCount(2);
  await page.reload();
  await expect(pagination.getByRole("button", { name: "第 3 頁" })).toHaveAttribute("aria-current", "page");
  await page.getByRole("combobox", { name: "訓練專項" }).selectOption("核心");
  await expect(page).not.toHaveURL(/page=/);
  await expect(page.locator(".course-row")).toHaveCount(4);
  await expect(pagination).toHaveCount(0);
  await page.getByLabel("搜尋課程或教練").fill("不存在");
  await expect(page.locator(".course-row")).toHaveCount(0);
  await expect(page.getByText("這個條件目前沒有課程", { exact: false })).toBeVisible();
});

test("schedule clamps invalid pages and fits mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/schedule?page=999");
  const pagination = page.getByRole("navigation", { name: "課程分頁" });
  await expect(page).toHaveURL(/page=7/);
  await expect(page.locator(".course-row")).toHaveCount(4);
  await expect(pagination.locator("button[aria-label^='第']")).toHaveText(["5", "6", "7"]);
  await expect(pagination.getByRole("button", { name: "下一頁" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.goto("/schedule?page=invalid&q=訓練");
  await expect(page.locator(".course-row")).toHaveCount(6);
  await expect(page).not.toHaveURL(/page=/);
  await expect(pagination.getByRole("button", { name: "第 1 頁" })).toHaveAttribute("aria-current", "page");
});
