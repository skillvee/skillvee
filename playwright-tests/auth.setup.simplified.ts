import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  console.log('🔐 Starting simplified email/password authentication...');
  
  // Load environment variables
  const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;
  
  if (!testEmail || !testPassword) {
    throw new Error('❌ Please set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD in .env.test file');
  }
  
  console.log(`📧 Using test email: ${testEmail}`);
  
  // Go directly to sign-in page
  await page.goto('/sign-in');
  console.log('📍 Navigated to sign-in page');

  // Wait for page to load - use domcontentloaded instead of networkidle for better performance
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  
  // Skip Google and go straight to email/password
  console.log('📝 Looking for email input field...');
  const emailInput = page.locator('input[name="identifier"], input[type="email"]').first();
  
  // Wait for email input to be visible
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Found email input field');
  
  // Fill email
  await emailInput.fill(testEmail);
  console.log('📧 Filled email address');
  
  // Click Continue button
  const continueBtn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
  if (await continueBtn.isVisible({ timeout: 5000 })) {
    console.log('🔗 Clicking Continue button...');
    await continueBtn.click();
    await page.waitForTimeout(3000); // Wait for form transition
  }
  
  // Look for password field
  console.log('🔍 Looking for password field...');
  const passwordInput = page.locator('input[type="password"]').first();
  
  try {
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    console.log('🔒 Found password field');
    
    // Fill password
    await passwordInput.fill(testPassword);
    console.log('🔑 Filled password');
    
    // Click Sign In button
    const signInBtn = page.locator('button:has-text("Sign in"), button:has-text("Continue"), button[type="submit"]').first();
    if (await signInBtn.isVisible({ timeout: 5000 })) {
      console.log('🚀 Clicking Sign In button...');
      await signInBtn.click();
    }
  } catch (error) {
    console.log('⚠️  Password field not found - account might not exist');
    console.log('💡 If this is your first time, create the account manually first:');
    console.log(`   1. Go to http://localhost:3000/sign-up`);
    console.log(`   2. Create account with: ${testEmail}`);
    console.log(`   3. Use password: ${testPassword}`);
    console.log(`   4. Then retry this authentication setup`);
    
    throw new Error(`Account ${testEmail} might not exist. Please create it manually first.`);
  }

  console.log('⏳ Waiting for authentication to complete...');
  
  // Wait for successful authentication - look for redirect or URL change
  try {
    await Promise.race([
      // Wait for redirect away from sign-in
      page.waitForURL(url => !url.includes('/sign-in'), { timeout: 15000 }),
      // Or wait for specific pages
      page.waitForURL('**/dashboard**', { timeout: 15000 }),
      page.waitForURL('/', { timeout: 15000 })
    ]);
    
    console.log(`✅ Authentication successful! Current URL: ${page.url()}`);
  } catch (error) {
    console.log(`⚠️  No redirect detected. Current URL: ${page.url()}`);
    
    // Check if we're still on sign-in page (indicating failure)
    if (page.url().includes('/sign-in')) {
      console.log('❌ Still on sign-in page - authentication may have failed');
      throw new Error('Authentication failed - still on sign-in page');
    }
  }

  // Verify authentication by checking for user indicators
  console.log('🔍 Verifying authentication state...');
  
  // Go to home page to check auth state
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
  
  // Check for authentication indicators
  const authIndicators = [
    page.locator('[data-clerk-element="userButton"]'),
    page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")'),
    page.locator('text=Welcome back'),
    page.locator('.cl-userButton-root')
  ];

  let isAuthenticated = false;
  for (const indicator of authIndicators) {
    if (await indicator.isVisible({ timeout: 3000 })) {
      console.log('✅ Found authentication indicator');
      isAuthenticated = true;
      break;
    }
  }

  // Final verification - try to access a protected page
  if (!isAuthenticated) {
    console.log('🧪 Testing protected page access...');
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    
    if (!page.url().includes('/sign-in')) {
      console.log('✅ Can access dashboard - authentication verified');
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    console.log('❌ Authentication verification failed');
    console.log(`Current URL: ${page.url()}`);
    throw new Error('Could not verify authentication state');
  }

  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log(`💾 Authentication state saved to: ${authFile}`);
  console.log('🎉 Authentication setup completed successfully!');
});