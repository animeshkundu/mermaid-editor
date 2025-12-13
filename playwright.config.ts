import { defineConfig, devices } from '@playwright/test';

const WEB_SERVER_TIMEOUT = 60000;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5000',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host --port 5000',
    url: 'http://localhost:5000/',
    reuseExistingServer: !process.env.CI,
    timeout: WEB_SERVER_TIMEOUT,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
