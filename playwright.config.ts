import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  workers: 2,
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 240_000,
  },
  use: { baseURL: "http://localhost:3100" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "phone-360", use: { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true } },
    { name: "phone-320", use: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true } },
  ],
});
