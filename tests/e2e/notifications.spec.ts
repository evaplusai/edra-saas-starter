import { test, expect, loginAsUser } from './fixtures';

test.describe('Notification flows', () => {
  test('notification bell is visible in header after login', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    // The notification bell button has sr-only text "Notifications"
    const bellButton = page.getByRole('button', { name: /notifications/i });
    await expect(bellButton).toBeVisible();
  });

  test('clicking notification bell opens dropdown', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const bellButton = page.getByRole('button', { name: /notifications/i });
    await bellButton.click();

    // Dropdown should appear with "Notifications" label and "View all" link
    await expect(page.getByText('Notifications', { exact: true })).toBeVisible();
    await expect(page.getByText('View all')).toBeVisible();
  });

  test('notifications page renders after navigation', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/notifications');

    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();
  });

  test('unauthenticated visit to /dashboard/notifications redirects to login', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await expect(page).toHaveURL(/\/login/);
  });
});
