import { Page, expect } from '@playwright/test';

/**
 * Utility functions for authentication testing
 */

/**
 * Check if user is authenticated by looking for auth indicators
 */
export async function verifyAuthenticated(page: Page): Promise<boolean> {
  const authIndicators = [
    page.locator('[data-clerk-element="userButton"]'),
    page.locator('button', { hasText: 'Dashboard' }),
    page.locator('text=Welcome back'),
    page.locator('[data-testid="user-menu"]'),
    page.locator('.cl-userButton-root') // Clerk's user button class
  ];

  for (const indicator of authIndicators) {
    if (await indicator.isVisible({ timeout: 3000 })) {
      return true;
    }
  }
  
  return false;
}

/**
 * Expect that the user is authenticated
 */
export async function expectAuthenticated(page: Page) {
  const isAuth = await verifyAuthenticated(page);
  expect(isAuth, 'User should be authenticated').toBe(true);
}

/**
 * Check if we're on a sign-in page (indicating not authenticated)
 */
export async function isOnSignInPage(page: Page): Promise<boolean> {
  return page.url().includes('/sign-in') || 
         page.url().includes('/sign-up') ||
         await page.locator('text=Sign in to SkillVee').isVisible({ timeout: 3000 });
}

/**
 * Navigate to a protected page and ensure we can access it
 */
export async function navigateToProtectedPage(page: Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Should not be redirected to sign-in
  const isSignIn = await isOnSignInPage(page);
  expect(isSignIn, `Should be able to access ${url} when authenticated`).toBe(false);
}

/**
 * Test helper to verify a page requires authentication
 */
export async function verifyPageRequiresAuth(page: Page, url: string) {
  // Clear any existing auth state
  await page.context().clearCookies();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Should be redirected to sign-in or show auth prompt
  const needsAuth = await isOnSignInPage(page) || 
    await page.locator('text=Sign in required').isVisible({ timeout: 3000 });
  
  expect(needsAuth, `Page ${url} should require authentication`).toBe(true);
}

/**
 * Get the current user's display information if available
 */
export async function getCurrentUserInfo(page: Page): Promise<{
  email?: string;
  name?: string;
  isAuthenticated: boolean;
}> {
  const isAuth = await verifyAuthenticated(page);
  
  if (!isAuth) {
    return { isAuthenticated: false };
  }

  // Try to extract user info from various sources
  let email: string | undefined;
  let name: string | undefined;

  // Look for user button or menu that might contain user info
  const userButton = page.locator('[data-clerk-element="userButton"]').first();
  if (await userButton.isVisible({ timeout: 3000 })) {
    // Click to open menu and look for user info
    await userButton.click();
    
    const emailElement = page.locator('[data-testid="user-email"]').or(
      page.locator('text=@').first()
    );
    
    if (await emailElement.isVisible({ timeout: 2000 })) {
      email = await emailElement.textContent() || undefined;
    }
    
    // Close the menu
    await page.keyboard.press('Escape');
  }

  return {
    email,
    name,
    isAuthenticated: true
  };
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page) {
  // Look for sign out button or user menu
  const userButton = page.locator('[data-clerk-element="userButton"]').first();
  
  if (await userButton.isVisible({ timeout: 5000 })) {
    await userButton.click();
    
    // Look for sign out option
    const signOutBtn = page.locator('button', { hasText: 'Sign out' }).or(
      page.locator('[data-testid="sign-out"]')
    ).first();
    
    if (await signOutBtn.isVisible({ timeout: 3000 })) {
      await signOutBtn.click();
      await page.waitForLoadState('networkidle');
    }
  }
  
  // Verify we're signed out
  const isAuth = await verifyAuthenticated(page);
  expect(isAuth, 'User should be signed out').toBe(false);
}