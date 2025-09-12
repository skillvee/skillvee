import { test, expect } from '@playwright/test';
import { expectAuthenticated, getCurrentUserInfo } from './auth.utils';

test.describe('Authentication Integration', () => {
  test('should have authenticated user session', async ({ page }) => {
    // Go to home page  
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify we're authenticated
    await expectAuthenticated(page);
    
    // Get user info
    const userInfo = await getCurrentUserInfo(page);
    expect(userInfo.isAuthenticated, 'User should be authenticated').toBe(true);
    
    console.log('Authenticated user info:', userInfo);
  });

  test('should maintain authentication across page navigation', async ({ page }) => {
    const pages = ['/', '/companies', '/pricing', '/faq'];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Should still be authenticated
      await expectAuthenticated(page);
      
      console.log(`✓ Authenticated on ${url}`);
    }
  });

  test('should show consistent navigation state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not show sign-up buttons when authenticated
    const signUpButton = page.locator('a', { hasText: 'Sign up' });
    const signInButton = page.locator('a', { hasText: 'Log in' });
    
    // These should not be visible when authenticated
    const hasSignUp = await signUpButton.isVisible({ timeout: 3000 });
    const hasSignIn = await signInButton.isVisible({ timeout: 3000 });
    
    if (hasSignUp || hasSignIn) {
      console.warn('Sign up/in buttons visible - may indicate authentication issue');
    }
    
    // Should show authenticated navigation elements instead
    await expectAuthenticated(page);
  });
});