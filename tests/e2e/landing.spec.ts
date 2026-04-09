import { test, expect } from './fixtures';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section renders with CTA buttons', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /build your saas/i })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: /get started free/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible();
  });

  test('features grid has 6 cards', async ({ page }) => {
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // Each feature is rendered inside a Card with a CardTitle
    const featureCards = featuresSection.locator('[class*="card"]');
    await expect(featureCards).toHaveCount(6);
  });

  test('footer renders with link sections', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Footer has Product, Company, Legal sections
    await expect(footer.getByText('Product')).toBeVisible();
    await expect(footer.getByText('Company')).toBeVisible();
    await expect(footer.getByText('Legal')).toBeVisible();

    // Footer links exist
    await expect(footer.getByRole('link', { name: /features/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /pricing/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /blog/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /terms/i })).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    // Click Login link
    await page.getByRole('link', { name: /^login$/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Go back and click Sign Up
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });
});
