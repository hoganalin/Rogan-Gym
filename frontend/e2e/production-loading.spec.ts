import { expect, test } from "@playwright/test";

test("production loads earnings only when opened and preserves navigation while loading", async ({ page, context }) => {
  const scripts: string[] = [];
  page.on("request", request => {
    if (request.resourceType() === "script") scripts.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "主要導覽", exact: true })).toBeVisible();
  expect(scripts.some(url => url.includes("EarningsView-"))).toBe(false);
  const token = `e30.${Buffer.from(JSON.stringify({ id: "test-coach", role: "COACH", exp: 4102444800 })).toString("base64url")}.test`;
  await context.addCookies([{ name: "token", value: token, url: new URL(page.url()).origin }]);
  await page.route("**/api/**", route => {
    if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/users/profile")
      ? { user: { name: "載入測試教練", role: "COACH" } }
      : { total: { revenue: 0, participants: 0, course_count: 0 }, courses: [] };
    return route.fulfill({ json: { status: "success", data } });
  });
  let releaseChunk!: () => void;
  const gate = new Promise<void>(resolve => { releaseChunk = resolve; });
  await page.route("**/assets/EarningsView-*.js", async route => {
    await gate;
    await route.continue();
  });
  await page.goto("/coach/earnings", { waitUntil: "domcontentloaded" });
  try {
    await expect(page.getByRole("status")).toHaveText("正在載入頁面…");
    await expect(page.getByRole("navigation", { name: "主要導覽", exact: true })).toBeVisible();
  } finally {
    releaseChunk();
  }
  await expect(page.getByRole("heading", { name: "營收報表" })).toBeVisible();
  expect(scripts.some(url => url.includes("EarningsView-"))).toBe(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "營收報表" })).toBeVisible();
});

test("production public deep links reload without page errors or horizontal overflow", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/coaches", "/schedule", "/fitness-plans", "/login", "/signup"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await page.reload();
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    }
  }
  expect(errors).toEqual([]);
});
