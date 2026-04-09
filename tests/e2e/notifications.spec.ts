import { test, expect } from './fixtures';

test.describe('Notifications', () => {
  test('unauthenticated visit to /dashboard/notifications redirects to login', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await expect(page).toHaveURL(/\/login/);
  });
});
