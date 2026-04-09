import { test, expect } from './fixtures';

test.describe('Payment & Pricing', () => {
  test('pricing section renders on landing page', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    await expect(
      pricingSection.getByRole('heading', { name: /simple, transparent pricing/i })
    ).toBeVisible();
  });

  test('3 tier cards are visible', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    // The pricing component renders a 3-column grid of Card components
    const tierCards = pricingSection.locator('[class*="card"]');
    await expect(tierCards).toHaveCount(3);
  });

  test('subscribe buttons exist on paid plans', async ({ page }) => {
    await page.goto('/');

    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    // Free tier has "Get Started", paid tiers have "Subscribe"
    const subscribeButtons = pricingSection.getByRole('button', { name: /subscribe/i });
    // There should be at least one subscribe button (for pro/enterprise plans)
    const count = await subscribeButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('/dashboard/subscription page redirects unauthenticated to login', async ({ page }) => {
    await page.goto('/dashboard/subscription');

    // Unauthenticated users are redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});
