import { test, expect, loginAsUser } from './fixtures';

test.describe('Payment & Subscription flows', () => {
  test('landing page shows 3 pricing tiers', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    const tierCards = pricingSection.locator('[class*="card"]');
    await expect(tierCards).toHaveCount(3);
  });

  test('subscription page shows current plan status', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/subscription');

    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible();

    // Should show either "Free Plan" card or a subscription card with plan name
    const freePlan = page.getByText('Free Plan');
    const planHeading = page.locator('[class*="card"]').first();
    await expect(freePlan.or(planHeading)).toBeVisible({ timeout: 10_000 });
  });

  test('subscription page has plan management options', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard/subscription');

    await expect(page.getByRole('heading', { name: /subscription/i })).toBeVisible();

    // The page should show a Plans section with pricing cards
    await expect(page.getByRole('heading', { name: /plans/i })).toBeVisible();
  });

  test('unauthenticated visit to /dashboard/subscription redirects to login', async ({ page }) => {
    await page.goto('/dashboard/subscription');
    await expect(page).toHaveURL(/\/login/);
  });
});
