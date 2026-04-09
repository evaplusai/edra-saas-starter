import { test, expect, loginAsUser } from './fixtures';

test.describe('Dashboard flows', () => {
  test('sidebar shows Dashboard, Settings, Subscription items', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();
    await expect(sidebar.getByText('Subscription')).toBeVisible();
  });

  test('navigate to Profile page and verify name/email displayed', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/profile');

    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();

    // The profile page shows the user's name and email
    await expect(page.getByText('Regular User')).toBeVisible();
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('navigate to Settings page and verify toggles render', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/settings');

    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    // Settings page has notification preference switches
    await expect(page.getByText('Marketing Emails')).toBeVisible();
    await expect(page.getByText('Product Emails')).toBeVisible();
    await expect(page.getByText('In-App Notifications')).toBeVisible();

    // Verify at least one switch element is present
    const switches = page.locator('button[role="switch"]');
    await expect(switches.first()).toBeVisible();
  });

  test('navigate to API Keys page, create a new key, and verify it appears', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/api-keys');

    await expect(page.getByRole('heading', { name: /api keys/i })).toBeVisible();

    // Click "Create Key" button
    await page.getByRole('button', { name: /create key/i }).click();

    // Dialog should open
    await expect(page.getByRole('heading', { name: /create api key/i })).toBeVisible();

    // Fill in key name and create
    const keyName = `test-key-${Date.now()}`;
    await page.getByLabel('Key Name').fill(keyName);
    await page.getByRole('button', { name: /^create$/i }).click();

    // After creation, the dialog shows "API Key Created" with the key value
    await expect(page.getByRole('heading', { name: /api key created/i })).toBeVisible({
      timeout: 10_000,
    });

    // Close the dialog
    await page.getByRole('button', { name: /done/i }).click();

    // Verify the key appears in the table
    await expect(page.getByText(keyName)).toBeVisible();
  });

  test('toggle dark mode and verify class changes on html element', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const toggleButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(toggleButton).toBeVisible();

    // Click toggle and check html class changes
    const htmlEl = page.locator('html');
    const classBefore = await htmlEl.getAttribute('class');
    await toggleButton.click();
    // Wait briefly for theme transition
    await page.waitForTimeout(500);
    const classAfter = await htmlEl.getAttribute('class');

    // The class should have changed (light/dark toggle)
    expect(classAfter).not.toBe(classBefore);
  });
});
