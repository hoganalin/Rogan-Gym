/// <reference lib="dom" />
import { expect, test } from "@playwright/test";

test("photo preview recovers when a failed URL is replaced without saving", async ({ page, context, baseURL }) => {
  const writes: string[] = [];
  const token = `e30.${Buffer.from(JSON.stringify({ id: "preview-coach", role: "COACH", exp: 4102444800 })).toString("base64url")}.test`;
  await context.addCookies([{ name: "token", value: token, url: baseURL! }]);
  await page.route("**/api/**", route => {
    if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
    if (route.request().method() !== "GET") writes.push(route.request().method());
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith("/users/profile")
      ? { user: { name: "許志豪", role: "COACH" } }
      : path.endsWith("/coach")
        ? { experience_years: 5, description: "教練照片預覽", skill_ids: [], profile_image_url: "https://preview.example/preview-broken.png" }
        : [];
    return route.fulfill({ json: { status: "success", data } });
  });
  await page.route("**/preview-broken.png", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.route("**/preview-valid.svg", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="orange"/></svg>',
  }));
  await page.goto("/coach/profile");
  await expect(page.getByRole("heading", { name: "教練檔案" })).toBeVisible();
  const preview = page.locator("main");
  await expect(preview.getByText("許", { exact: true })).toBeVisible();
  await page.getByLabel(/個人照片網址/).fill("https://preview.example/preview-valid.svg");
  await expect(preview.locator("img")).toBeVisible();
  await expect.poll(() => preview.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByLabel(/個人照片網址/).fill("");
  await expect(preview.getByText("許", { exact: true })).toBeVisible();
  expect(writes).toEqual([]);
});
