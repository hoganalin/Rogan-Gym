import { expect, test } from "@playwright/test";

test("protected skill and package mutations send credentials; public reads do not", async ({ page, context }) => {
  const requests: { method: string; path: string; authorization?: string }[] = [];
  await page.route("**/api/**", route => {
    if (!["fetch", "xhr"].includes(route.request().resourceType())) return route.continue();
    const request = route.request();
    requests.push({ method: request.method(), path: new URL(request.url()).pathname, authorization: request.headers().authorization });
    return route.fulfill({ json: { status: "success", data: [] } });
  });
  await page.goto("/login");
  await page.getByRole("button", { name: "登入", exact: true }).waitFor();
  await context.addCookies([{ name: "token", value: "test-only-auth-sentinel", url: new URL(page.url()).origin }]);
  await page.evaluate(async () => {
    const modulePath = "/src/lib/request.ts";
    const { default: request } = await import(modulePath);
    await request.post("coaches/skill", { name: "test" });
    await request.delete("coaches/skill/11111111-1111-4111-a111-111111111111");
    await request.post("credit-package", { name: "test", price: 100, credit_amount: 1 });
    await request.get("coaches/skill");
    await request.get("credit-package");
  });
  const mutations = requests.filter(r => r.method !== "GET");
  expect(mutations).toHaveLength(3);
  for (const request of mutations) expect(request.authorization).toBe("Bearer test-only-auth-sentinel");
  for (const request of requests.filter(r => r.method === "GET")) expect(request.authorization).toBeUndefined();
});
