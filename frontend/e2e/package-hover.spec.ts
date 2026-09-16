import { expect, test } from "@playwright/test";

for (const url of ["/", "/fitness-plans"]) {
  test(`package hover follows pointer and restores styling on ${url}`, async ({ page }) => {
    await page.route("**/api/**", (route) => ["fetch", "xhr"].includes(route.request().resourceType()) ? route.fulfill({ json: {
      status: "success",
      data: route.request().url().includes("credit-package") ? [
        { id: "trial", name: "體驗方案", price: 2400, credit_amount: 4 },
        { id: "standard", name: "標準方案", price: 8800, credit_amount: 16 },
        { id: "annual", name: "年度方案", price: 24000, credit_amount: 48 },
      ] : [],
    } }) : route.continue());
    await page.goto(url);
    const trial = page.getByRole("heading", { name: "體驗方案", exact: true }).locator("..");
    const annual = page.getByRole("heading", { name: "年度方案", exact: true }).locator("..");
    await trial.scrollIntoViewIfNeeded();
    await trial.hover();
    await expect(trial).toHaveCSS("border-top-color", "rgb(244, 80, 30)");
    await expect(trial).toHaveCSS("translate", "0px -6px");
    await annual.hover();
    await expect(trial).toHaveCSS("border-top-color", "rgb(34, 36, 42)");
    await expect(annual).toHaveCSS("border-top-color", "rgb(244, 80, 30)");
    await page.mouse.move(0, 0);
    await expect(annual).toHaveCSS("border-top-color", "rgb(74, 59, 51)");
    await trial.getByRole("button").focus();
    await expect(trial).toHaveCSS("border-top-color", "rgb(244, 80, 30)");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(trial).toHaveCSS("translate", "none");
    await expect(trial).toHaveCSS("border-top-color", "rgb(244, 80, 30)");
  });
}
