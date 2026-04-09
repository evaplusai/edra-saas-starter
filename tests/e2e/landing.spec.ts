import { test, expect } from './fixtures';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section renders with CTA buttons', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /build your saas/i }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /get started free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible();
  });

  test('features grid has 6 cards', async ({ page }) => {
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    const featureCards = featuresSection.locator('[class*="card"]');
    await expect(featureCards).toHaveCount(6);
  });

  test('pricing section shows 3 tiers', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    await expect(
      pricingSection.getByRole('heading', { name: /simple, transparent pricing/i }),
    ).toBeVisible();

    const tierCards = pricingSection.locator('[class*="card"]');
    await expect(tierCards).toHaveCount(3);
  });

  test('footer renders with link sections', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    await expect(footer.getByText('Product')).toBeVisible();
    await expect(footer.getByText('Company')).toBeVisible();
    await expect(footer.getByText('Legal')).toBeVisible();

    await expect(footer.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible();
  });

  test('click "Sign Up" CTA navigates to /signup', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('click "Login" in navbar navigates to /login', async ({ page }) => {
    await page.getByRole('link', { name: /^login$/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
