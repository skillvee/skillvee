import { test, expect } from '@playwright/test';
import { verifyPageRequiresAuth, isOnSignInPage } from './auth.utils';

test.describe('Public Pages (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication
    await page.context().clearCookies();
  });

  test('should access home page without authentication', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not be redirected to sign-in
    const needsAuth = await isOnSignInPage(page);
    expect(needsAuth, 'Home page should be accessible without auth').toBe(false);
    
    // Should see sign up/sign in buttons
    const signUpBtn = page.locator('a', { hasText: 'Sign up' });
    const signInBtn = page.locator('a', { hasText: 'Log in' });
    
    await expect(signUpBtn.or(signInBtn)).toBeVisible();
  });

  test('should access companies page without authentication', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    // Should not be redirected to sign-in
    const needsAuth = await isOnSignInPage(page);
    expect(needsAuth, 'Companies page should be accessible without auth').toBe(false);
    
    // Should see the companies page content
    await expect(page.locator('h1')).toContainText(['Companies', 'Hire', 'data scientists']);
  });

  test('should access pricing page without authentication', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Should not be redirected to sign-in
    const needsAuth = await isOnSignInPage(page);
    expect(needsAuth, 'Pricing page should be accessible without auth').toBe(false);
    
    // Should see pricing content
    await expect(page).toHaveTitle(/Pricing|SkillVee/);
  });

  test('should access FAQ page without authentication', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');
    
    // Should not be redirected to sign-in
    const needsAuth = await isOnSignInPage(page);
    expect(needsAuth, 'FAQ page should be accessible without auth').toBe(false);
  });

  test('dashboard should require authentication', async ({ page }) => {
    await verifyPageRequiresAuth(page, '/dashboard');
  });

  test('practice page should require authentication', async ({ page }) => {
    await verifyPageRequiresAuth(page, '/practice');
  });

  test('interview page should require authentication', async ({ page }) => {
    await verifyPageRequiresAuth(page, '/interview');
  });

  test('sign-in page should be accessible', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Should show sign-in form
    await expect(page.locator('text=Sign in to SkillVee')).toBeVisible({ timeout: 5000 });
  });

  test('sign-up page should be accessible', async ({ page }) => {
    await page.goto('/sign-up');
    await page.waitForLoadState('networkidle');
    
    // Should show sign-up form  
    await expect(page.locator('text=SkillVee')).toBeVisible({ timeout: 5000 });
  });
});