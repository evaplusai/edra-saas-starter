import { test, expect } from './fixtures';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section renders with CTA buttons', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /build your saas/i }),
    ).toBeVisible();

    // Hero has "Get Started Free" link (Button asChild wrapping Link)
    await expect(page.getByRole('link', { name: /get started free/i })).toBeVisible();
    // "Learn More" is an anchor link to #features
    await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible();
  });

  test('features grid has 6 cards', async ({ page }) => {
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // Each feature is a Card component rendered inside a motion.div.
    // The Card component renders a div with "card" in its class names.
    // We look for CardTitle elements (the feature title headings) to count cards.
    const featureHeadings = featuresSection.locator('[class*="card-header"]');
    await expect(featureHeadings).toHaveCount(6);
  });

  test('pricing section shows 3 tiers', async ({ page }) => {
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeVisible();

    await expect(
      pricingSection.getByRole('heading', { name: /simple, transparent pricing/i }),
    ).toBeVisible();

    // Pricing cards are loaded asynchronously from the API. Wait for them.
    // Each plan is a Card with a CardTitle heading.
    const planHeadings = pricingSection.locator('[class*="card"]').filter({
      has: page.locator('[class*="card-header"]'),
    });
    await expect(planHeadings).toHaveCount(3, { timeout: 10_000 });
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
    // The navbar has a "Sign Up" link (Button asChild wrapping Link to /signup)
    await page.getByRole('link', { name: /sign up/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('click "Login" in navbar navigates to /login', async ({ page }) => {
    // The navbar has "Login" text inside a Button asChild wrapping Link to /login
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
