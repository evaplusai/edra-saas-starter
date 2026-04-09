/* eslint-disable react-hooks/rules-of-hooks, no-empty-pattern */
import { test as base, type Page } from '@playwright/test';

/**
 * Helper to register a test user and return authenticated page state.
 * For E2E tests that only verify UI rendering, authentication is not needed.
 * This fixture provides a convenience wrapper for tests that require auth state.
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const testUser: TestUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

/**
 * Fill the signup form with test user credentials.
 * Does not submit -- caller can assert or submit as needed.
 */
export async function fillSignupForm(page: Page, user: TestUser = testUser) {
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
}

/**
 * Fill the login form with test user credentials.
 * Does not submit -- caller can assert or submit as needed.
 */
export async function fillLoginForm(page: Page, user: TestUser = testUser) {
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
}

/** Extended test fixture with test user helpers */
export const test = base.extend<{ testUserData: TestUser }>({
  testUserData: async ({}, use) => {
    await use(testUser);
  },
});

export { expect } from '@playwright/test';
