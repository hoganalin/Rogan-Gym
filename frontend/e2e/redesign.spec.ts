import { expect, test } from "@playwright/test";
const courseDate = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
const course = {
  id: "c1",
  name: "肌力入門",
  description: "循序練習基本動作",
  start_at: `${courseDate}T10:00:00+08:00`,
  end_at: `${courseDate}T11:00:00+08:00`,
  coach_name: "林教練",
  skill_name: "重量訓練",
  max_participants: 8,
};
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => {
    if (!["fetch", "xhr"].includes(route.request().resourceType()))
      return route.continue();
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (/coaches\/?$/.test(path))
      data = [{ id: "1", user_id: "u1", name: "林教練" }];
    else if (/coaches\/1\/courses/.test(path)) data = [course];
    else if (/coaches\/1$/.test(path))
      data = {
        user: { name: "林教練", role: "COACH" },
        coach: {
          experience_years: 5,
          description: "適合初學者",
          profile_image_url: null,
          skills: ["肌力"],
        },
      };
    return route.fulfill({ json: { status: "success", data } });
  });
});
test("home search opens matching courses and coach filters can reset", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("搜尋教練或訓練專項").fill("重量訓練");
  await page.getByRole("button", { name: "尋找課程", exact: true }).click();
  await expect(page).toHaveURL(/schedule\?q=/);
  await expect(page.getByRole("heading", { name: "肌力入門" })).toBeVisible();
  await page.goto("/coaches?q=林");
  await expect(page.getByRole("heading", { name: "林教練" })).toBeVisible();
  await page.getByLabel("搜尋教練姓名或專項").fill("不存在");
  await expect(
    page.getByText("找不到符合條件的教練", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "清除篩選" }).click();
  await expect(page.getByRole("heading", { name: "林教練" })).toBeVisible();
});
test("mobile navigation and dated schedule preserve return after login", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "開啟導覽" }).click();
  await page
    .getByRole("navigation", { name: "手機導覽" })
    .getByRole("link", { name: "選課與預約" })
    .click();
  await page.getByLabel("開課日期", { exact: true }).fill(courseDate);
  await expect(page.getByRole("heading", { name: "肌力入門" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page
    .getByRole("button", { name: "報名 肌力入門", exact: true })
    .click();
  await expect(page).toHaveURL(/login\?next=%2Fschedule%3Fdate/);
  await expect(
    page.getByText("登入後回到剛才的頁面，繼續完成預約。"),
  ).toBeVisible();
});
test("failed requests expose a retry instead of an empty roster", async ({
  page,
}) => {
  await page.route("**/api/coaches/**", (route) =>
    route.fulfill({ status: 503, json: { message: "unavailable" } }),
  );
  await page.goto("/coaches");
  await expect(page.getByRole("alert")).toContainText("載入教練列表失敗");
  await expect(page.getByRole("button", { name: "重新載入" })).toBeVisible();
});

test('multiple specialties use OR matching and survive reload', async ({ page }) => {
  await page.route('**/api/coaches/1', route => route.fulfill({ json: { status: 'success', data: { user: { name: '林教練', role: 'COACH' }, coach: { experience_years: 5, description: '初學者訓練', profile_image_url: null, skills: ['肌力', '核心'] } } } }));
  await page.goto('/coaches');
  await page.getByRole('button', { name: '肌力', exact: true }).click();
  await page.getByRole('button', { name: '核心', exact: true }).click();
  await expect(page.getByRole('button', { name: '肌力', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '核心', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(new URL(page.url()).searchParams.getAll('skill')).toEqual(['肌力', '核心']);
  await page.reload();
  await expect(page.getByRole('button', { name: '肌力', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '核心', exact: true }).click();
  await expect(page.getByRole('heading', { name: '林教練' })).toBeVisible();
});
