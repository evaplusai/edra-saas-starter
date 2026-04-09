import { test, expect, loginAsUser, waitForAuthResolved } from './fixtures';

test.describe('Notification flows', () => {
  test('notification bell is visible in header after login', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    // The notification bell button has sr-only text "Notifications"
    const bellButton = page.getByRole('button', { name: /notifications/i });
    await expect(bellButton).toBeVisible({ timeout: 10_000 });
  });

  test('clicking notification bell opens dropdown', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const bellButton = page.getByRole('button', { name: /notifications/i });
    await expect(bellButton).toBeVisible({ timeout: 10_000 });
    await bellButton.click();

    // Dropdown should appear with "Notifications" label and "View all" link
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('View all')).toBeVisible();
  });

  test('notifications page renders after navigation', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/notifications');

    // The notifications page heading is "Notifications" (h1 text-2xl font-bold)
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated visit to /dashboard/notifications redirects to login', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await waitForAuthResolved(page);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
