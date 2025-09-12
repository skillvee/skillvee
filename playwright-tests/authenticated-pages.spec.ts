import { test, expect } from '@playwright/test';
import { expectAuthenticated, navigateToProtectedPage } from './auth.utils';

test.describe('Authenticated Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Verify we start authenticated
    await page.goto('/');
    await expectAuthenticated(page);
  });

  test('should access dashboard when authenticated', async ({ page }) => {
    await navigateToProtectedPage(page, '/dashboard');
    
    // Verify dashboard loads correctly
    await expect(page.locator('h1')).toContainText(['Dashboard', 'Welcome']);
  });

  test('should access practice page when authenticated', async ({ page }) => {
    await navigateToProtectedPage(page, '/practice');
    
    // Verify practice page loads correctly
    await expect(page.locator('h1')).toContainText('mock interview');
  });

  test('should access interview page when authenticated', async ({ page }) => {
    await navigateToProtectedPage(page, '/interview');
    
    // Verify interview page loads correctly
    await expect(page).toHaveTitle(/Interview|SkillVee/);
  });

  test('should show user authentication state in navigation', async ({ page }) => {
    await page.goto('/');
    
    // Should show authenticated elements
    const userButton = page.locator('[data-clerk-element="userButton"]');
    const dashboardBtn = page.locator('a[href="/dashboard"]', { hasText: 'Dashboard' });
    
    // At least one should be visible
    const hasUserButton = await userButton.isVisible({ timeout: 3000 });
    const hasDashboardBtn = await dashboardBtn.isVisible({ timeout: 3000 });
    
    expect(hasUserButton || hasDashboardBtn, 'Should show authenticated navigation elements').toBe(true);
  });

  test('should be able to navigate between authenticated pages', async ({ page }) => {
    // Start at home
    await page.goto('/');
    await expectAuthenticated(page);

    // Navigate to practice
    await page.click('a[href="/practice"]');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/practice');

    // Navigate to dashboard if link exists
    const dashboardLink = page.locator('a[href="/dashboard"]');
    if (await dashboardLink.isVisible({ timeout: 3000 })) {
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/dashboard');
    }

    // Go back to home
    await page.goto('/');
    await expectAuthenticated(page);
  });
});