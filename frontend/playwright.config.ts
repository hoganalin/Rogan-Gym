import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 5175);
const preview = process.env.E2E_PREVIEW === "true";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  // The auth unit harness imports a source module; chunk delivery is tested against dist.
  testIgnore: preview ? "**/request-auth.spec.ts" : "**/production-loading.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run ${preview ? "preview" : "dev"} -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && !process.env.E2E_PORT,
    timeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
