import { test, expect, registerUser, loginUser, loginAsUser, seedUser } from './fixtures';

test.describe('Authentication flows', () => {
  test('register a new user and land on dashboard or verify-email', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await registerUser(page, {
      name: 'New E2E User',
      email: uniqueEmail,
      password: 'SecurePass123!',
    });

    // After registration the app should redirect to the root (which resolves
    // to either dashboard or a verify-email page depending on config).
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|verify-email)?$/);
  });

  test('login with seeded user credentials and verify dashboard loads', async ({ page }) => {
    await loginAsUser(page);

    // The login page navigates to "/" on success, which may redirect to /dashboard
    // or stay at "/" depending on routing. Verify we are no longer on /login.
    await expect(page).not.toHaveURL(/\/login/);

    // Navigate to dashboard explicitly to confirm auth works
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('login with wrong password shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(seedUser.email);
    await page.getByLabel('Password', { exact: true }).fill('wrongpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Error message should appear within the form
    await expect(page.locator('.bg-destructive\\/10')).toBeVisible({ timeout: 10_000 });
  });

  test('logout redirects to login page', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Open the user dropdown in the header and click "Sign out"
    await page.getByRole('button', { name: /^$/ }).filter({ has: page.locator('span.relative') }).or(
      page.locator('header button').last()
    ).click();

    const signOutItem = page.getByText('Sign out');
    if (await signOutItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await signOutItem.click();
    }

    // After sign out, visiting dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('visit /dashboard without auth redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
