/// <reference lib="dom" />
import { expect, test } from "@playwright/test";

test("photo preview recovers when a failed URL is replaced without saving", async ({ page }) => {
  await page.route("**/preview-broken.png", (route) => route.fulfill({ status: 404, body: "missing" }));
  await page.route("**/preview-valid.svg", (route) => route.fulfill({
    contentType: "image/svg+xml",
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="orange"/></svg>',
  }));
  await page.goto("/");
  await page.evaluate(async () => {
    // Mount the real shared component with the same live input binding as ProfileView.
    const load = (path: string) => import(/* @vite-ignore */ path);
    const { default: React } = await load("/node_modules/.vite/deps/react.js");
    const { default: { createRoot } } = await load("/node_modules/.vite/deps/react-dom_client.js");
    const { CoachMedia } = await load("/src/components/CoachMedia.tsx");
    const host = document.createElement("section");
    host.id = "preview-test";
    document.body.append(host);
    function Preview() {
      const [src, setSrc] = React.useState("/preview-broken.png");
      return React.createElement(React.Fragment, null,
        React.createElement("input", { "aria-label": "測試照片網址", value: src, onChange: (event: Event) => setSrc((event.target as HTMLInputElement).value) }),
        React.createElement(CoachMedia, { src, name: "許志豪" }),
      );
    }
    createRoot(host).render(React.createElement(Preview));
  });
  const preview = page.locator("#preview-test");
  await expect(preview.getByText("許", { exact: true })).toBeVisible();
  await page.getByLabel("測試照片網址").fill("/preview-valid.svg");
  await expect(preview.locator("img")).toBeVisible();
  await expect.poll(() => preview.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByLabel("測試照片網址").fill("");
  await expect(preview.getByText("許", { exact: true })).toBeVisible();
});
