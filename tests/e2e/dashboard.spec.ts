import { test, expect, loginAsUser } from './fixtures';

test.describe('Dashboard flows', () => {
  test('sidebar shows Dashboard, Settings, Subscription items', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');

    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Dashboard')).toBeVisible({ timeout: 10_000 });
    await expect(sidebar.getByText('Settings')).toBeVisible();
    await expect(sidebar.getByText('Subscription')).toBeVisible();
  });

  test('navigate to Profile page and verify name/email displayed', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/profile');

    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible({ timeout: 10_000 });

    // The profile page shows the user's name and email in the account info section
    await expect(page.getByText('Regular User')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('user@example.com')).toBeVisible();
  });

  test('navigate to Settings page and verify toggles render', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/settings');

    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({ timeout: 10_000 });

    // Settings page has notification preference switches.
    // Labels are rendered as <Label> elements with these texts.
    await expect(page.getByText('Marketing Emails')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Product Emails')).toBeVisible();
    await expect(page.getByText('In-App Notifications')).toBeVisible();

    // Verify at least one switch element is present
    const switches = page.locator('button[role="switch"]');
    await expect(switches.first()).toBeVisible();
  });

  test('navigate to API Keys page, create a new key, and verify it appears', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/api-keys');

    await expect(page.getByRole('heading', { name: /api keys/i })).toBeVisible({ timeout: 10_000 });

    // Click "Create Key" button
    await page.getByRole('button', { name: /create key/i }).click();

    // Dialog should open with title "Create API Key"
    await expect(page.getByRole('heading', { name: /create api key/i })).toBeVisible();

    // Fill in key name and create.
    // The label in the dialog is "Key Name" with htmlFor="key-name"
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

    // ThemeToggle button has sr-only text "Toggle theme" — use the one in the header
    const toggleButton = page.locator('header').getByRole('button', { name: /toggle theme/i });
    await expect(toggleButton).toBeVisible({ timeout: 10_000 });

    // Click toggle twice to ensure a change cycle
    await toggleButton.click();
    await page.waitForTimeout(500);
    const classAfterFirst = await page.locator('html').getAttribute('class');
    await toggleButton.click();
    await page.waitForTimeout(500);
    const classAfterSecond = await page.locator('html').getAttribute('class');

    // After two toggles, the classes should differ at least once
    expect(classAfterFirst).not.toBe(classAfterSecond);
  });
});
