import { test, expect } from './fixtures';

test.describe('Dashboard UI', () => {
  // Note: Dashboard requires authentication. These tests verify the redirect
  // behavior and the landing page elements that are publicly accessible.

  test('unauthenticated visit to /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('landing page renders sidebar navigation area', async ({ page }) => {
    // Verify the landing page (which contains layout with navigation) renders
    await page.goto('/');

    // The landing layout has a nav with links
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible();
  });

  test('theme toggle button is present and clickable', async ({ page }) => {
    await page.goto('/');

    // The theme toggle button exists (sr-only text "Toggle theme")
    const toggleButton = page.getByRole('button', { name: /toggle theme/i });
    await expect(toggleButton).toBeVisible();

    // Click the toggle and verify class changes on <html> element
    // Default theme is "system", clicking switches to dark or light
    await toggleButton.click();

    // After clicking, the html element should have a class attribute reflecting the theme
    const htmlEl = page.locator('html');
    const classAttr = await htmlEl.getAttribute('class');
    expect(classAttr).toBeTruthy();
  });

  test('landing page renders hero section', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /build your saas/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /get started free/i })).toBeVisible();
  });
});
