import { test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  console.log("🔐 Starting authentication setup...");

  // Load environment variables
  const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    throw new Error(
      "❌ Please set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD in .env.test file",
    );
  }

  console.log(`📧 Using test email: ${testEmail}`);

  // Go to the sign-in page
  await page.goto("/sign-in");
  console.log("📍 Navigated to sign-in page");

  // Wait for the sign-in form to load with a longer timeout
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    console.log("✅ Sign-in page loaded");
  } catch (error) {
    console.log("⚠️  Page might still be loading, continuing...");
  }

  // Look for Google sign-in button (since we use Google OAuth)
  const googleButton = page
    .locator("button", { hasText: "Google" })
    .or(page.locator('[data-provider="google"]'))
    .or(page.locator('button[data-clerk-element-id*="google"]'))
    .first();

  if (await googleButton.isVisible({ timeout: 5000 })) {
    console.log("🔍 Found Google sign-in button, attempting Google OAuth...");

    try {
      await googleButton.click();
      console.log("🔗 Clicked Google button");

      // Wait for either Google OAuth redirect or stay on same domain
      await Promise.race([
        page.waitForURL("**/oauth/google**", { timeout: 8000 }),
        page.waitForURL("**accounts.google.com**", { timeout: 8000 }),
        page.waitForTimeout(5000), // Fallback timeout
      ]);

      console.log(`🌐 Current URL after Google click: ${page.url()}`);

      // If we're on Google's domain, handle the OAuth flow
      if (page.url().includes("google.com")) {
        console.log("📝 Filling Google credentials...");

        // Fill in Google credentials
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible({ timeout: 5000 })) {
          await emailInput.fill(testEmail);

          const nextBtn = page
            .locator('#identifierNext, button:has-text("Next")')
            .first();
          if (await nextBtn.isVisible({ timeout: 3000 })) {
            await nextBtn.click();
            await page.waitForTimeout(2000);
          }

          // Wait for password field
          const passwordInput = page.locator('input[type="password"]').first();
          if (await passwordInput.isVisible({ timeout: 5000 })) {
            await passwordInput.fill(testPassword);

            const passwordNext = page
              .locator('#passwordNext, button:has-text("Next")')
              .first();
            if (await passwordNext.isVisible({ timeout: 3000 })) {
              await passwordNext.click();
            }
          }
        }
      }
    } catch (error) {
      console.log(
        `⚠️  Google OAuth flow issue: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.log("🔄 Trying email/password fallback...");
    }
  } else {
    // Fallback: try email/password form if available
    console.log("Google button not found, looking for email/password form...");
    const emailInput = page
      .locator('input[name="identifier"]')
      .or(page.locator('input[type="email"]'))
      .first();

    if (await emailInput.isVisible({ timeout: 5000 })) {
      console.log("📝 Found email input, using email/password flow...");
      await emailInput.fill(testEmail);

      // Click continue or find password field
      const continueBtn = page
        .locator('button:has-text("Continue"), button[type="submit"]')
        .first();

      if (await continueBtn.isVisible({ timeout: 3000 })) {
        console.log("🔗 Clicking Continue button...");
        await continueBtn.click();
        await page.waitForTimeout(2000);
      }

      // Look for password field
      const passwordInput = page.locator('input[type="password"]');
      if (await passwordInput.isVisible({ timeout: 5000 })) {
        console.log("🔒 Filling password...");
        await passwordInput.fill(testPassword);

        const signInBtn = page
          .locator('button:has-text("Sign in"), button[type="submit"]')
          .first();
        if (await signInBtn.isVisible({ timeout: 3000 })) {
          console.log("🚀 Clicking Sign In button...");
          await signInBtn.click();
        }
      }
    } else {
      console.log("❌ No email input found on sign-in page");
      throw new Error("Could not find sign-in form elements");
    }
  }

  console.log("⏳ Waiting for authentication to complete...");

  // Wait for successful authentication and redirect
  try {
    // Wait for either redirect to dashboard or home page, or URL change indicating success
    await Promise.race([
      page.waitForURL("**/dashboard**", { timeout: 20000 }),
      page.waitForURL("/", { timeout: 20000 }),
      page.waitForURL("**/practice**", { timeout: 20000 }),
      page.waitForURL((url) => !url.href.includes("/sign-in"), {
        timeout: 20000,
      }),
    ]);

    console.log(
      `✅ Authentication redirect detected! Current URL: ${page.url()}`,
    );
  } catch (error) {
    console.log(
      "⚠️  No obvious redirect, checking auth state on current page...",
    );

    // Try to navigate away from sign-in to verify auth worked
    await page.goto("/");
    await page.waitForLoadState("networkidle", { timeout: 10000 });
    console.log(`📍 Navigated to home page: ${page.url()}`);
  }

  // Verify we're authenticated by checking for user elements
  const authIndicators = [
    page.locator('[data-clerk-element="userButton"]'),
    page.locator("button", { hasText: "Dashboard" }),
    page.locator("text=Welcome back"),
    page.locator('[data-testid="user-menu"]'),
  ];

  let isAuthenticated = false;
  for (const indicator of authIndicators) {
    if (await indicator.isVisible({ timeout: 5000 })) {
      console.log(
        "Authentication verified with indicator:",
        await indicator.textContent(),
      );
      isAuthenticated = true;
      break;
    }
  }

  if (!isAuthenticated) {
    // Try navigating to a protected page to verify auth
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // If we're not redirected to sign-in, we're probably authenticated
    if (!page.url().includes("/sign-in")) {
      isAuthenticated = true;
      console.log("Authentication verified by accessing dashboard");
    }
  }

  if (!isAuthenticated) {
    throw new Error(
      "Authentication failed - could not verify user is signed in",
    );
  }

  // Save signed-in state to reuse in tests
  await page.context().storageState({ path: authFile });
  console.log("Authentication state saved to:", authFile);
});
