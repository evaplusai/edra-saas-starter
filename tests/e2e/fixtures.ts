/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, type Page, expect } from '@playwright/test';

/**
 * Seeded user credentials (must match src/server/db/seed.ts).
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const seedAdmin: TestUser = {
  email: 'admin@example.com',
  password: 'password123',
  name: 'Admin User',
};

export const seedUser: TestUser = {
  email: 'user@example.com',
  password: 'password123',
  name: 'Regular User',
};

/**
 * Wait for the app to finish its initial auth check.
 * The ProtectedRoute shows "Loading..." while useAuth().isLoading is true,
 * then either redirects to /login or renders the child route.
 * For public pages, we just wait for the main content to render.
 */
export async function waitForAuthResolved(page: Page) {
  // Wait for the loading indicator to disappear (if present)
  const loadingEl = page.getByText('Loading...');
  // Give it a moment to appear, then wait for it to disappear
  await loadingEl.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {
    // Loading text may never appear if auth resolves immediately (no token)
  });
}

/**
 * Register a new user via the signup form.
 * Waits for navigation away from /signup after submission.
 */
export async function registerUser(
  page: Page,
  user: { name: string; email: string; password: string },
) {
  await page.goto('/signup');
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /create account/i }).click();
  // After successful registration the app navigates away from /signup
  await page.waitForURL((url) => !url.pathname.includes('/signup'), {
    timeout: 10_000,
  });
}

/**
 * Login via the login form. Waits for navigation away from /login.
 */
export async function loginUser(
  page: Page,
  user: { email: string; password: string },
) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for navigation away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10_000,
  });
}

/**
 * Login with the seeded admin account.
 */
export async function loginAsAdmin(page: Page) {
  await loginUser(page, seedAdmin);
}

/**
 * Login with the seeded regular user account.
 */
export async function loginAsUser(page: Page) {
  await loginUser(page, seedUser);
}

/** Extended test fixture */
export const test = base.extend<{ testUserData: TestUser }>({
  testUserData: async ({}, use) => {
    await use(seedUser);
  },
});

export { expect };
