import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5188',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npx vite --port 5188 --strictPort',
      url: 'http://localhost:5188',
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        ...process.env,
        VITE_API_URL: 'http://localhost:3001',
      },
    },
    {
      command: 'npx tsx src/server/index.ts',
      url: 'http://localhost:3001/health',
      reuseExistingServer: false,
      timeout: 30_000,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/edra_test',
        JWT_SECRET: process.env.JWT_SECRET ?? 'test-secret-key-for-e2e-testing-min32chars',
        APP_URL: 'http://localhost:5188',
        PORT: '3001',
      },
    },
  ],
});
