import { test, expect, loginAsAdmin, loginAsUser } from './fixtures';

test.describe('Admin flows', () => {
  test('admin sees Admin nav items (Users, Analytics, Activity)', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard');

    const sidebar = page.locator('aside');
    // Wait for sidebar to be visible and populated
    await expect(sidebar.getByText('Dashboard')).toBeVisible({ timeout: 10_000 });

    // The Admin parent item and its children should be visible for admin users
    await expect(sidebar.getByText('Admin')).toBeVisible();
    await expect(sidebar.getByText('Users')).toBeVisible();
    await expect(sidebar.getByText('Analytics')).toBeVisible();
    await expect(sidebar.getByText('Activity')).toBeVisible();
  });

  test('admin navigates to Users page and sees user table with seeded users', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin/users');

    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10_000 });

    // The table should render with seeded users
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('admin@example.com')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('admin searches for a user by email and sees filtered results', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin/users');

    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 });

    // Type in search box
    await page.getByPlaceholder('Search by name or email...').fill('user@example.com');

    // Wait for debounced search to complete and table to update
    await page.waitForTimeout(500);

    // The filtered table should show user@example.com but not admin@example.com
    await expect(page.getByText('user@example.com')).toBeVisible();
    // admin@example.com should be filtered out (not visible in the table body)
    const adminRow = page.locator('tbody').getByText('admin@example.com');
    await expect(adminRow).toHaveCount(0);
  });

  test('non-admin user does NOT see Admin nav items', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible({ timeout: 10_000 });

    // Admin section should not be visible to regular users
    const adminLink = sidebar.getByText('Admin', { exact: true });
    await expect(adminLink).toHaveCount(0);
  });
});
