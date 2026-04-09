import { test, expect, loginAsUser, waitForAuthResolved } from './fixtures';

test.describe('Payment & Subscription flows', () => {
  test('landing page shows 3 pricing tiers', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    // Pricing cards are loaded asynchronously from the API.
    // Each plan renders as a Card with a card-header.
    const planCards = pricingSection.locator('[class*="card"]').filter({
      has: page.locator('[class*="card-header"]'),
    });
    await expect(planCards).toHaveCount(3, { timeout: 10_000 });
  });

  test('subscription page shows current plan status', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/subscription');

    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({ timeout: 10_000 });

    // Should show either "Free Plan" text or a subscription card with plan name
    const freePlan = page.getByText('Free Plan');
    const planHeading = page.locator('[class*="card"]').first();
    await expect(freePlan.or(planHeading)).toBeVisible({ timeout: 10_000 });
  });

  test('subscription page has plan management options', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/subscription');

    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible({ timeout: 10_000 });

    // The page should show a "Plans" section heading
    await expect(page.getByRole('heading', { name: /plans/i })).toBeVisible({ timeout: 10_000 });
  });

  test('unauthenticated visit to /dashboard/subscription redirects to login', async ({ page }) => {
    await page.goto('/dashboard/subscription');
    await waitForAuthResolved(page);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
