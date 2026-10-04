import { defineConfig, devices } from '@playwright/test';

// CHROMIUM_PATH lets sandboxes reuse a pre-installed Chromium instead of downloading one.
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://localhost:4173/', launchOptions: { executablePath } },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'], browserName: 'chromium', launchOptions: { executablePath } } },
    { name: 'ipad', use: { viewport: { width: 1180, height: 820 }, browserName: 'chromium', launchOptions: { executablePath } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
