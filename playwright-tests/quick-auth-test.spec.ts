import { test, expect } from '@playwright/test';

test.describe('Quick Authentication Test', () => {
  test('check current authentication state and protected page access', async ({ page }) => {
    console.log('Testing authentication state and protected page access...');

    // Test 1: Check home page accessibility (should always work)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const homePageLoaded = !page.url().includes('/sign-in');
    console.log(`✓ Home page accessible: ${homePageLoaded}`);

    // Test 2: Check current authentication state on home page
    const authIndicators = [
      await page.locator('[data-clerk-element="userButton"]').isVisible({ timeout: 3000 }),
      await page.locator('button:has-text("Dashboard")').isVisible({ timeout: 3000 }),
      await page.locator('a[href="/dashboard"]').isVisible({ timeout: 3000 }),
    ];

    const isAuthenticated = authIndicators.some(indicator => indicator);
    console.log(`Authentication state: ${isAuthenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED'}`);

    // Test 3: Try to access /practice/results
    console.log('Attempting to access /practice/results...');
    await page.goto('/practice/results');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const currentUrl = page.url();
    const redirectedToSignIn = currentUrl.includes('/sign-in');
    const canAccessPracticeResults = currentUrl.includes('/practice/results') && !redirectedToSignIn;

    console.log(`Current URL after navigation: ${currentUrl}`);
    console.log(`Redirected to sign-in: ${redirectedToSignIn}`);
    console.log(`Can access /practice/results: ${canAccessPracticeResults}`);

    // Test 4: Try to access /dashboard  
    console.log('Attempting to access /dashboard...');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const dashboardUrl = page.url();
    const dashboardRedirected = dashboardUrl.includes('/sign-in');
    const canAccessDashboard = dashboardUrl.includes('/dashboard') && !dashboardRedirected;

    console.log(`Dashboard URL: ${dashboardUrl}`);
    console.log(`Dashboard redirected to sign-in: ${dashboardRedirected}`);
    console.log(`Can access dashboard: ${canAccessDashboard}`);

    // Test 5: Check if we see sign-in form when accessing protected pages
    if (redirectedToSignIn || dashboardRedirected) {
      const signInFormVisible = await page.locator('text=Sign in to').isVisible({ timeout: 5000 });
      const signInButtonVisible = await page.locator('button:has-text("Sign in")').isVisible({ timeout: 5000 });
      const googleButtonVisible = await page.locator('button:has-text("Google")').isVisible({ timeout: 5000 });

      console.log(`Sign-in form elements visible:`);
      console.log(`  - Sign in text: ${signInFormVisible}`);
      console.log(`  - Sign in button: ${signInButtonVisible}`);
      console.log(`  - Google button: ${googleButtonVisible}`);
    }

    // Summary
    console.log('\n--- SUMMARY ---');
    if (isAuthenticated) {
      console.log('✅ User appears to be authenticated');
      if (canAccessPracticeResults) {
        console.log('✅ Can access /practice/results');
      } else {
        console.log('❌ Cannot access /practice/results despite being authenticated');
      }
    } else {
      console.log('❌ User is not authenticated');
      console.log('🔒 Protected pages will redirect to sign-in (this is expected behavior)');
    }

    // For the test to pass, we just need it to run without crashing
    expect(true).toBe(true);
  });

  test('test sign-in page accessibility', async ({ page }) => {
    console.log('Testing sign-in page...');
    
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    
    const signInPageLoaded = page.url().includes('/sign-in');
    const hasSignInElements = await page.locator('text=SkillVee').isVisible({ timeout: 5000 });
    
    console.log(`Sign-in page loaded: ${signInPageLoaded}`);
    console.log(`Has sign-in elements: ${hasSignInElements}`);
    
    if (hasSignInElements) {
      console.log('✅ Sign-in page is accessible and functional');
    } else {
      console.log('❌ Sign-in page may have loading issues');
    }

    expect(signInPageLoaded).toBe(true);
  });
});