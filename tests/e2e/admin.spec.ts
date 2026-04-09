import { test, expect } from './fixtures';

test.describe('Admin pages', () => {
  test('unauthenticated visit to /dashboard/admin redirects to login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visit to /dashboard/admin/users redirects to login', async ({ page }) => {
    await page.goto('/dashboard/admin/users');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visit to /dashboard/admin/analytics redirects to login', async ({ page }) => {
    await page.goto('/dashboard/admin/analytics');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated visit to /dashboard/admin/activity redirects to login', async ({ page }) => {
    await page.goto('/dashboard/admin/activity');
    await expect(page).toHaveURL(/\/login/);
  });
});
