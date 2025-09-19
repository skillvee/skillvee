import { test, expect } from '@playwright/test';

test.describe('Clerk Branding Removal', () => {
  test('should not show "Secured by Clerk" or "Development mode" on sign-in page', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait a bit more for any dynamic content to load
    await page.waitForTimeout(1000);

    // Check that "Secured by Clerk" text is not visible anywhere on the page
    const securedByClerkText = page.locator('text=Secured by Clerk');
    await expect(securedByClerkText).toBeHidden();

    // Check that "Development mode" text is not visible anywhere on the page
    const developmentModeText = page.locator('text=Development mode');
    await expect(developmentModeText).toBeHidden();

    // Check that no elements with clerk badge classes are visible
    const clerkBadges = page.locator('.cl-badge, .cl-footer, .cl-footerPages');
    await expect(clerkBadges).toBeHidden();

    // Check that no elements with development-related data attributes are visible
    const developmentBadges = page.locator('[data-localization-key="badge__developmentMode"]');
    await expect(developmentBadges).toBeHidden();

    // Check that any orange colored text (typically used for dev mode) is not visible
    const orangeElements = page.locator('[style*="color: rgb(249, 115, 22)"], [style*="color: #f97316"]');
    await expect(orangeElements).toBeHidden();
  });

  test('should not show Clerk branding on sign-up page', async ({ page }) => {
    // Navigate to sign-up page
    await page.goto('/sign-up');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check that "Secured by Clerk" text is not visible
    const securedByClerkText = page.locator('text=Secured by Clerk');
    await expect(securedByClerkText).toBeHidden();

    // Check that "Development mode" text is not visible
    const developmentModeText = page.locator('text=Development mode');
    await expect(developmentModeText).toBeHidden();

    // Check that no clerk branding elements are visible
    const clerkBadges = page.locator('.cl-badge, .cl-footer, .cl-footerPages');
    await expect(clerkBadges).toBeHidden();
  });

  test('should have consistent primary color theme in sign-in form', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the primary button uses the site's blue color
    const primaryButton = page.locator('button[type="submit"]').first();
    await expect(primaryButton).toBeVisible();

    // Get computed styles to verify the primary color
    const buttonStyles = await primaryButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
      };
    });

    // Check that the background color contains the site's primary blue
    // rgb(35, 124, 241)
    expect(buttonStyles.backgroundColor).toContain('35');
  });

  test('should not display any clerk footer or branding elements after authentication components load', async ({ page }) => {
    // Navigate to sign-in page and wait for everything to load
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Wait for any dynamic content and mutations
    await page.waitForTimeout(2000);

    // Get all text content on the page
    const pageText = await page.textContent('body');

    // Assert that development mode text is not present anywhere
    expect(pageText).not.toContain('Development mode');
    expect(pageText).not.toContain('Secured by Clerk');
    expect(pageText).not.toContain('secured by clerk');
    expect(pageText).not.toContain('DEVELOPMENT MODE');

    // Check for any potential Clerk logos or branding images
    const clerkImages = page.locator('img[alt*="Clerk"], img[src*="clerk"]');
    await expect(clerkImages).toBeHidden();

    // Verify no elements with clerk-related classes are visible
    const clerkElements = page.locator('[class*="cl-footer"], [class*="cl-badge"], [class*="secured"], [class*="development"]');
    const clerkElementsCount = await clerkElements.count();

    // If any clerk elements exist, they should all be hidden
    for (let i = 0; i < clerkElementsCount; i++) {
      await expect(clerkElements.nth(i)).toBeHidden();
    }
  });

  test('should maintain clean appearance without branding in UserButton dropdown', async ({ page }) => {
    // This test requires authentication, so we'll navigate to a protected page
    // For now, we'll just check that if UserButton is present, it doesn't show branding
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for UserButton (might not be present if not authenticated)
    const userButton = page.locator('[class*="cl-userButton"]');

    if (await userButton.isVisible()) {
      // Click to open dropdown
      await userButton.click();

      // Wait for dropdown to appear
      await page.waitForTimeout(500);

      // Check that no clerk branding appears in the dropdown
      const dropdownText = await page.textContent('body');
      expect(dropdownText).not.toContain('Secured by Clerk');
      expect(dropdownText).not.toContain('Development mode');
    }
  });
});